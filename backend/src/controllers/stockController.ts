import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addStock = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, reason } = req.body;
    
    if (!product_id || !quantity || !reason || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // @ts-ignore
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: product_id } });
      if (!product) {
        throw new Error('Product not found');
      }

      const updatedProduct = await tx.product.update({
        where: { id: product_id },
        data: {
          current_stock: { increment: quantity }
        }
      });

      const movement = await tx.stockMovement.create({
        data: {
          product_id,
          quantity,
          movement_type: 'IN',
          reason,
          created_by: user?.name || 'System'
        }
      });

      return { product: updatedProduct, movement };
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
