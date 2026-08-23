import { Router } from 'express';
import { login, me } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rota pública - Login
router.post('/login', login);

// Rota protegida - Dados do usuário logado
router.get('/me', authenticate, me);

export default router;