import { Router } from 'express';
import {
    listar,
    buscarPorId,
    criar,
    atualizar,
    deletar
} from '../controllers/localidadeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Todas as rotas de localidades são protegidas
router.use(authenticate);

router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', deletar);

export default router;