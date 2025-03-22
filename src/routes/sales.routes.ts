import expres from 'express';
import { getSales, updateSales, createSales, deleteSales } from '../controllers/sales.controller';

const router = expres.Router();

router.get('/sales', getSales);
router.post('/sales', createSales);
router.put('/sales/:id', updateSales);
router.delete('/sales/:id', deleteSales);

export default router;

