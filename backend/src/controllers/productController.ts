import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, category, unit_price, current_stock, minimum_stock, location } = req.body;
    
    if (!name || !sku || !category || unit_price === undefined || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return res.status(400).json({ error: 'SKU already exists.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unit_price: Number(unit_price),
        current_stock: Number(current_stock) || 0,
        minimum_stock: Number(minimum_stock) || 0,
        location
      }
    });

    // If initial stock > 0, create an IN movement
    if (product.current_stock > 0) {
      // @ts-ignore
      const userName = req.user?.userId ? (await prisma.user.findUnique({ where: { id: req.user.userId } }))?.name || 'System' : 'System';
      await prisma.stockMovement.create({
        data: {
          product_id: product.id,
          quantity: product.current_stock,
          movement_type: 'IN',
          reason: 'Initial stock',
          created_by: userName
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, sku, category, unit_price, minimum_stock, location } = req.body;
    
    // Note: updating current_stock directly here is usually not recommended, 
    // it should be done through stock movements.
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        category,
        unit_price: Number(unit_price),
        minimum_stock: Number(minimum_stock),
        location
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
