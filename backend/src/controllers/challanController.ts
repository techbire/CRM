import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getChallans = async (req: Request, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        items: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChallan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }
    res.json(challan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChallan = async (req: Request, res: Response) => {
  try {
    const { customer_id, items } = req.body;
    
    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer and items are required' });
    }

    // @ts-ignore
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Validate products exist
    const productIds = items.map((i: any) => i.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    const challan_number = `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const total_quantity = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

    // Create Draft Challan
    const challan = await prisma.challan.create({
      data: {
        challan_number,
        customer_id,
        status: 'Draft',
        total_quantity,
        created_by: user?.name || 'System',
        items: {
          create: items.map((item: any) => {
            const product = products.find(p => p.id === item.product_id)!;
            return {
              product_id: product.id,
              product_name_snapshot: product.name,
              sku_snapshot: product.sku,
              unit_price_snapshot: product.unit_price,
              quantity: item.quantity
            };
          })
        }
      },
      include: { items: true }
    });

    res.status(201).json(challan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmChallan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // @ts-ignore
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userName = user?.name || 'System';

    // Interactive Transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!challan) {
        throw new Error('CHALLAN_NOT_FOUND');
      }

      if (challan.status !== 'Draft') {
        throw new Error('CHALLAN_NOT_DRAFT');
      }

      // Check stock for every product and decrement
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.product_id } });
        
        if (!product) {
          throw new Error(`Product ${item.product_name_snapshot} not found`);
        }

        if (product.current_stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.current_stock}, requested: ${item.quantity}.`);
        }

        // Reduce stock
        await tx.product.update({
          where: { id: product.id },
          data: { current_stock: { decrement: item.quantity } }
        });

        // Create OUT stock movement
        await tx.stockMovement.create({
          data: {
            product_id: product.id,
            quantity: item.quantity,
            movement_type: 'OUT',
            reason: `Sales challan ${challan.challan_number}`,
            created_by: userName
          }
        });
      }

      // Mark challan as Confirmed
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'Confirmed' },
        include: { items: true }
      });

      return confirmedChallan;
    });

    res.json(result);
  } catch (error: any) {
    if (error.message === 'CHALLAN_NOT_FOUND') {
      return res.status(404).json({ error: 'Challan not found' });
    }
    if (error.message === 'CHALLAN_NOT_DRAFT') {
      return res.status(400).json({ error: 'Only Draft challans can be confirmed' });
    }
    if (error.message.startsWith('Insufficient stock') || error.message.startsWith('Product')) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
