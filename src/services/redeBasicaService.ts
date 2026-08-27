// src/services/redeBasicaService.ts

import pool from '../config/database';

export const redeBasicaService = {
  listar: async (filtros: any): Promise<any[]> => {
    let query = `
      SELECT rb.*, 
             p.nome as psf_nome, 
             l.nome as localidade_nome 
      FROM rede_basica rb
      LEFT JOIN psf p ON rb.psf_id = p.id
      LEFT JOIN localidades l ON rb.localidade_id = l.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filtros.ano) {
      query += ' AND rb.ano = ?';
      values.push(filtros.ano);
    }
    if (filtros.localidade_id) {
      query += ' AND rb.localidade_id = ?';
      values.push(filtros.localidade_id);
    }
    if (filtros.psf_id) {
      query += ' AND rb.psf_id = ?';
      values.push(filtros.psf_id);
    }
    if (filtros.nome) {
      query += ' AND rb.nome LIKE ?';
      values.push(`%${filtros.nome}%`);
    }

    query += ' ORDER BY rb.id DESC';

    const [rows] = await pool.execute(query, values);
    return rows as any[];
  },

  buscarPorId: async (id: number): Promise<any | null> => {
    const [rows] = await pool.execute(`
      SELECT rb.*, 
             p.nome as psf_nome, 
             l.nome as localidade_nome 
      FROM rede_basica rb
      LEFT JOIN psf p ON rb.psf_id = p.id
      LEFT JOIN localidades l ON rb.localidade_id = l.id
      WHERE rb.id = ?
    `, [id]);
    return (rows as any[])[0] || null;
  },

  criar: async (data: any): Promise<any> => {
    const [result] = await pool.execute('INSERT INTO rede_basica SET ?', [data]);
    return result;
  },

  atualizar: async (id: number, data: any): Promise<any> => {
    const [result] = await pool.execute('UPDATE rede_basica SET ? WHERE id = ?', [data, id]);
    return result;
  },

  deletar: async (id: number): Promise<any> => {
    const [result] = await pool.execute('DELETE FROM rede_basica WHERE id = ?', [id]);
    return result;
  }
};