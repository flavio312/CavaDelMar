import express from "express";
import { loginUser } from "../controllers/login.controller";

const router = express.Router();

router.post('/userlogin',loginUser);
router.get('/userlogin',loginUser);

export default router;