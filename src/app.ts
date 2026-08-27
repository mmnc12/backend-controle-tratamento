import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import localidadeRoutes from './routes/localidadeRoutes';
import psfRoutes from './routes/psfRoutes';
import redeBasicaRoutes from './routes/redeBasicaRoutes';
import rotinaRoutes from './routes/rotinaRoutes';
import relatorioRoutes from './routes/relatorioRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

app.use(helmet());

// 🔥 RATE LIMIT - AUMENTADO PARA TESTES
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 🔥 1000 REQUISIÇÕES
    message: {
        error: 'Muitas requisições, tente novamente mais tarde.'
    }
});
app.use(limiter);

// 🔥 CORS - LIBERADO PARA TODAS AS ORIGENS (temporário para testes)
app.use(cors({
    origin: '*', // 🔥 PERMITIR TODAS AS ORIGENS
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROTA DE TESTE
// ============================================

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'OK',
        message: 'API do Sistema de Controle de Tratamento está rodando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// ROTAS DA API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/localidades', localidadeRoutes);
app.use('/api/psf', psfRoutes);
app.use('/api/rede-basica', redeBasicaRoutes);
app.use('/api/rotina', rotinaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// ============================================
// MIDDLEWARE DE ERRO 404
// ============================================

app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: 'A rota solicitada não existe'
    });
});

// ============================================
// MIDDLEWARE DE ERRO GLOBAL
// ============================================

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Erro:', err.message);
    res.status(err.status || 500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, async () => {
    console.log(`
    ============================================
    🚀 SERVIDOR INICIADO COM SUCESSO!
    ============================================
    📡 Porta: ${PORT}
    🌐 Ambiente: ${process.env.NODE_ENV || 'development'}
    🔗 URL: http://localhost:${PORT}
    ============================================
    `);
    await testConnection();
});

export default app;