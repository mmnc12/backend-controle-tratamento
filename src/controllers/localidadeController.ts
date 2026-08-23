import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/database';

// ============================================
// LISTAR TODAS AS LOCALIDADES
// ============================================
export const listar = async (res: Response) => {
    try {
        const localidades = await query<any>(
            'SELECT * FROM localidades ORDER BY nome'
        );
        
        return res.status(200).json({
            success: true,
            data: localidades,
            total: localidades.length
        });
    } catch (error) {
        console.error('Erro ao listar localidades:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar localidades'
        });
    }
};

// ============================================
// BUSCAR LOCALIDADE POR ID
// ============================================
export const buscarPorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const localidade = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [id]
        );
        
        if (!localidade) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Localidade não encontrada'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: localidade
        });
    } catch (error) {
        console.error('Erro ao buscar localidade:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar localidade'
        });
    }
};

// ============================================
// CRIAR LOCALIDADE
// ============================================
export const criar = async (req: Request, res: Response) => {
    try {
        const { codigo, nome, descricao } = req.body;
        
        // Validar campos obrigatórios
        if (!codigo || !nome) {
            return res.status(400).json({
                error: 'Campos obrigatórios',
                message: 'Código e nome são obrigatórios'
            });
        }
        
        // Verificar se código já existe
        const existe = await queryOne<any>(
            'SELECT * FROM localidades WHERE codigo = ?',
            [codigo]
        );
        
        if (existe) {
            return res.status(400).json({
                error: 'Duplicado',
                message: 'Código já cadastrado'
            });
        }
        
        // Inserir usando a função execute
        const result = await execute(
            'INSERT INTO localidades (codigo, nome, descricao) VALUES (?, ?, ?)',
            [codigo, nome, descricao || null]
        );
        
        // Buscar a localidade criada
        const novaLocalidade = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [result.insertId]
        );
        
        return res.status(201).json({
            success: true,
            message: 'Localidade criada com sucesso',
            data: novaLocalidade
        });
    } catch (error) {
        console.error('Erro ao criar localidade:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao criar localidade'
        });
    }
};

// ============================================
// ATUALIZAR LOCALIDADE
// ============================================
export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { codigo, nome, descricao } = req.body;
        
        // Verificar se existe
        const existe = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [id]
        );
        
        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Localidade não encontrada'
            });
        }
        
        // Verificar se código já existe (para outro registro)
        if (codigo) {
            const codigoExiste = await queryOne<any>(
                'SELECT * FROM localidades WHERE codigo = ? AND id != ?',
                [codigo, id]
            );
            
            if (codigoExiste) {
                return res.status(400).json({
                    error: 'Duplicado',
                    message: 'Código já cadastrado para outra localidade'
                });
            }
        }
        
        // Atualizar usando a função execute
        await execute(
            'UPDATE localidades SET codigo = ?, nome = ?, descricao = ? WHERE id = ?',
            [codigo, nome, descricao || null, id]
        );
        
        // Buscar a localidade atualizada
        const localidadeAtualizada = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [id]
        );
        
        return res.status(200).json({
            success: true,
            message: 'Localidade atualizada com sucesso',
            data: localidadeAtualizada
        });
    } catch (error) {
        console.error('Erro ao atualizar localidade:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao atualizar localidade'
        });
    }
};

// ============================================
// DELETAR LOCALIDADE
// ============================================
export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Verificar se existe
        const existe = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [id]
        );
        
        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Localidade não encontrada'
            });
        }
        
        // Verificar se está sendo usada em rede_basica
        const emUsoRede = await queryOne<any>(
            'SELECT * FROM rede_basica WHERE localidade_id = ? LIMIT 1',
            [id]
        );
        
        if (emUsoRede) {
            return res.status(400).json({
                error: 'Não pode deletar',
                message: 'Localidade está sendo usada em pacientes da Rede Básica'
            });
        }
        
        // Verificar se está sendo usada em rotina
        const emUsoRotina = await queryOne<any>(
            'SELECT * FROM rotina WHERE localidade_id = ? LIMIT 1',
            [id]
        );
        
        if (emUsoRotina) {
            return res.status(400).json({
                error: 'Não pode deletar',
                message: 'Localidade está sendo usada em pacientes da Rotina'
            });
        }
        
        // Deletar usando a função execute
        await execute(
            'DELETE FROM localidades WHERE id = ?',
            [id]
        );
        
        return res.status(200).json({
            success: true,
            message: 'Localidade deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar localidade:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao deletar localidade'
        });
    }
};