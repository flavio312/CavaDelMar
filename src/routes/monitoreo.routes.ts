import express from 'express';
import { createTanque, getTanque, deleteTanque } from '../controllers/tanque.controller';

const router = express.Router();

router.get('/tanque', getTanque);
router.post('/tanque', createTanque);
router.delete('/tanque/:id', deleteTanque);

export default router;
