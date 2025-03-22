import express from 'express';
import { getPeces, createPeces, updatePeces, deletePeces } from '../controllers/peces.controller';

const router = express.Router();

router.get('/peces', getPeces);
router.post('/peces', createPeces);
router.put('/peces/:id', updatePeces);
router.delete('/peces/:id', deletePeces);

export default router;