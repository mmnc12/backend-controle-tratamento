import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-aqui';

export interface TokenPayload {
    id: number;
    email: string;
    perfil: 'admin' | 'usuario' | 'visualizador';
}

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Token não fornecido'
            });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Formato do token inválido. Use: Bearer TOKEN'
            });
        }

        const token = parts[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Token inválido ou expirado'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao processar autenticação'
        });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Não autorizado',
            message: 'Usuário não autenticado'
        });
    }

    if (req.user.perfil !== 'admin') {
        return res.status(403).json({
            error: 'Acesso negado',
            message: 'Apenas administradores podem acessar este recurso'
        });
    }

    return next();
};