import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.followUpNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@erp.com', password_hash: passwordHash, role: 'Admin' }
  });
  const sales = await prisma.user.create({
    data: { name: 'Sales Rep', email: 'sales@erp.com', password_hash: passwordHash, role: 'Sales' }
  });
  const warehouse = await prisma.user.create({
    data: { name: 'Warehouse Mgr', email: 'warehouse@erp.com', password_hash: passwordHash, role: 'Warehouse' }
  });
  const accounts = await prisma.user.create({
    data: { name: 'Accounts Dept', email: 'accounts@erp.com', password_hash: passwordHash, role: 'Accounts' }
  });

  console.log('Seeding Customers...');
  const c1 = await prisma.customer.create({
    data: {
      name: 'Ravi Sharma', mobile: '9876543210', email: 'ravi@sharmaelectricals.in', business_name: 'Sharma Electricals',
      gst_number: '29ABCDE1234F1Z5', customer_type: 'Retail', address: '123 Market Rd, Bangalore', status: 'Active'
    }
  });
  const c2 = await prisma.customer.create({
    data: {
      name: 'Amit Gupta', mobile: '8765432109', email: 'amit@guptamart.com', business_name: 'Gupta Wholesale Mart',
      gst_number: '07FGHIJ5678K1Z2', customer_type: 'Wholesale', address: '45 Trade Center, Delhi', status: 'Active'
    }
  });
  
  await prisma.followUpNote.create({
    data: { customer_id: c1.id, note: 'Called customer regarding next week\'s requirement.', created_by: sales.name }
  });

  console.log('Seeding Products...');
  const p1 = await prisma.product.create({
    data: { name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', unit_price: 500, current_stock: 50, minimum_stock: 10, location: 'A-1' }
  });
  const p2 = await prisma.product.create({
    data: { name: 'USB Keyboard', sku: 'UK-002', category: 'Electronics', unit_price: 800, current_stock: 30, minimum_stock: 5, location: 'A-2' }
  });
  const p3 = await prisma.product.create({
    data: { name: 'HDMI Cable', sku: 'HC-003', category: 'Cables', unit_price: 250, current_stock: 100, minimum_stock: 20, location: 'B-1' }
  });

  console.log('Adding Initial Stock Movements...');
  await prisma.stockMovement.createMany({
    data: [
      { product_id: p1.id, quantity: 50, movement_type: 'IN', reason: 'Initial Inventory', created_by: admin.name },
      { product_id: p2.id, quantity: 30, movement_type: 'IN', reason: 'Initial Inventory', created_by: admin.name },
      { product_id: p3.id, quantity: 100, movement_type: 'IN', reason: 'Initial Inventory', created_by: admin.name }
    ]
  });

  console.log('Seeding completed successfully!');
  console.log('Test Credentials (password: password123):');
  console.log('admin@erp.com, sales@erp.com, warehouse@erp.com, accounts@erp.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
