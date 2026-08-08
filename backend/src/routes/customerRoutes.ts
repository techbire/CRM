import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, addFollowUp } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// All authenticated users can view customers
router.get('/', getCustomers);
router.get('/:id', getCustomer);

// Only Sales and Admin can create/edit customers
router.post('/', authorize(['Sales']), createCustomer);
router.put('/:id', authorize(['Sales']), updateCustomer);
router.post('/:id/followups', authorize(['Sales']), addFollowUp);

export default router;
