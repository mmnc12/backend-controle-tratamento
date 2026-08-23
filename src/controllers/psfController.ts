import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/database';

// ============================================
// LISTAR TODOS OS PSFs
// ============================================
export const listar = async (_req: Request, res: Response) => {
    try {
        const psfs = await query<any>(
            'SELECT * FROM psf ORDER BY nome'
        );

        return res.status(200).json({
            success: true,
            data: psfs,
            total: psfs.length
        });
    } catch (error) {
        console.error('Erro ao listar PSFs:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar PSFs'
        });
    }
};

// ============================================
// BUSCAR PSF POR ID
// ============================================
export const buscarPorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const psf = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [id]
        );

        if (!psf) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'PSF não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: psf
        });
    } catch (error) {
        console.error('Erro ao buscar PSF:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar PSF'
        });
    }
};

// ============================================
// CRIAR PSF
// ============================================
export const criar = async (req: Request, res: Response) => {
    try {
        console.log('📝 Body recebido:', req.body);

        const { nome, nome_enfermeira } = req.body;

        console.log('📝 Nome:', nome);
        console.log('📝 Nome enfermeira:', nome_enfermeira);

        // Validar campos obrigatórios
        if (!nome) {
            console.log('❌ Nome não fornecido');
            return res.status(400).json({
                error: 'Campos obrigatórios',
                message: 'Nome do PSF é obrigatório'
            });
        }

        // Verificar se nome já existe
        const existe = await queryOne<any>(
            'SELECT * FROM psf WHERE nome = ?',
            [nome]
        );

        if (existe) {
            return res.status(400).json({
                error: 'Duplicado',
                message: 'PSF já cadastrado com este nome'
            });
        }

        // Inserir
        const result = await execute(
            'INSERT INTO psf (nome, nome_enfermeira) VALUES (?, ?)',
            [nome, nome_enfermeira || null]
        );

        console.log('✅ Inserido com ID:', result.insertId);

        // Buscar o PSF criado
        const novoPSF = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'PSF criado com sucesso',
            data: novoPSF
        });
    } catch (error) {
        console.error('Erro ao criar PSF:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao criar PSF'
        });
    }
};

// ============================================
// ATUALIZAR PSF
// ============================================
export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, nome_enfermeira } = req.body;

        // Verificar se existe
        const existe = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [id]
        );

        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'PSF não encontrado'
            });
        }

        // Verificar se nome já existe (para outro registro)
        if (nome) {
            const nomeExiste = await queryOne<any>(
                'SELECT * FROM psf WHERE nome = ? AND id != ?',
                [nome, id]
            );

            if (nomeExiste) {
                return res.status(400).json({
                    error: 'Duplicado',
                    message: 'Nome já cadastrado para outro PSF'
                });
            }
        }

        // Atualizar
        await execute(
            'UPDATE psf SET nome = ?, nome_enfermeira = ? WHERE id = ?',
            [nome, nome_enfermeira || null, id]
        );

        // Buscar o PSF atualizado
        const psfAtualizado = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'PSF atualizado com sucesso',
            data: psfAtualizado
        });
    } catch (error) {
        console.error('Erro ao atualizar PSF:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao atualizar PSF'
        });
    }
};

// ============================================
// DELETAR PSF
// ============================================
export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verificar se existe
        const existe = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [id]
        );

        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'PSF não encontrado'
            });
        }

        // Verificar se está sendo usado em rede_basica
        const emUsoRede = await queryOne<any>(
            'SELECT * FROM rede_basica WHERE psf_id = ? LIMIT 1',
            [id]
        );

        if (emUsoRede) {
            return res.status(400).json({
                error: 'Não pode deletar',
                message: 'PSF está sendo usado em pacientes da Rede Básica'
            });
        }

        // Verificar se está sendo usado em rotina
        const emUsoRotina = await queryOne<any>(
            'SELECT * FROM rotina WHERE psf_id = ? LIMIT 1',
            [id]
        );

        if (emUsoRotina) {
            return res.status(400).json({
                error: 'Não pode deletar',
                message: 'PSF está sendo usado em pacientes da Rotina'
            });
        }

        // Deletar
        await execute(
            'DELETE FROM psf WHERE id = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'PSF deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar PSF:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao deletar PSF'
        });
    }
};