import { Router } from 'express';
import {
    relatorioRedeBasicaCSV,
    relatorioRedeBasicaExcel,
    relatorioRedeBasicaPDF,
    relatorioRotinaCSV,
    relatorioRotinaExcel,
    relatorioRotinaPDF

} from '../controllers/relatorioController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Rotas protegidas
router.use(authenticate);

// Relatórios Rede Básica
router.get('/rede-basica/csv', relatorioRedeBasicaCSV);
router.get('/rede-basica/excel', relatorioRedeBasicaExcel);
router.get('/rede-basica/pdf', relatorioRedeBasicaPDF);

// Relatórios Rotina
router.get('/rotina/csv', relatorioRotinaCSV);
router.get('/rotina/excel', relatorioRotinaExcel);
router.get('/rotina/pdf', relatorioRotinaPDF);

export default router;