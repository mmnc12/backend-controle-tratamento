import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query, queryOne } from '../config/database';
import { LoginDTO, UsuarioResponse } from '../models/Usuario';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt-aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha }: LoginDTO = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: 'Campos obrigatórios',
                message: 'Email e senha são obrigatórios'
            });
        }

        const user = await queryOne<any>(
            'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        await query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                perfil: user.perfil
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const usuarioResponse: UsuarioResponse = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            perfil: user.perfil,
            ativo: user.ativo === 1,
            data_criacao: user.data_criacao,
            ultimo_login: user.ultimo_login
        };

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                usuario: usuarioResponse
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao processar login'
        });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Usuário não autenticado'
            });
        }

        const user = await queryOne<any>(
            'SELECT id, nome, email, perfil, ativo, data_criacao, ultimo_login FROM usuarios WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Usuário não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil,
                ativo: user.ativo === 1,
                data_criacao: user.data_criacao,
                ultimo_login: user.ultimo_login
            }
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar dados do usuário'
        });
    }
};