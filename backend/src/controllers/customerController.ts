import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;
    
    if (!name || !mobile || !email || !business_name || !customer_type || !address || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
        notes
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
        notes
      }
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFollowUp = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { note } = req.body;
    
    // @ts-ignore
    const userId = req.user?.userId;

    if (!note) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const followUp = await prisma.followUpNote.create({
      data: {
        customer_id: id,
        note,
        created_by: user?.name || 'Unknown'
      }
    });

    res.status(201).json(followUp);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
