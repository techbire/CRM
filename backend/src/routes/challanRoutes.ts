import { Router } from 'express';
import { getChallans, getChallan, createChallan, confirmChallan } from '../controllers/challanController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Everyone can view challans
router.get('/', getChallans);
router.get('/:id', getChallan);

// Only Sales and Admin can create/confirm challans
router.post('/', authorize(['Sales', 'Admin']), createChallan);
router.post('/:id/confirm', authorize(['Sales', 'Admin']), confirmChallan);

export default router;
