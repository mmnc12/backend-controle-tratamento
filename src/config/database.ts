import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'controle_tratamento_p',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // ⬇️ NOVAS CONFIGURAÇÕES PARA RESOLVER O ERRO ENETUNREACH
    connectTimeout: 10000,
    ssl: {
        rejectUnauthorized: false
    }
});

export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        console.log(`📊 Banco: ${process.env.DB_NAME || 'controle_tratamento_p'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    }
};

// ============================================
// Tipos para os resultados das queries
// ============================================

export type QueryResult<T = any> = T[];
export type QueryResultWithInsertId = {
    insertId: number;
    affectedRows: number;
    changedRows: number;
};

// ============================================
// FUNÇÕES DE QUERY
// ============================================

export const query = async <T = any>(sql: string, values?: any[]): Promise<T[]> => {
    try {
        const [rows] = await pool.execute(sql, values);
        return rows as T[];
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
};

export const queryOne = async <T = any>(sql: string, values?: any[]): Promise<T | null> => {
    try {
        const [rows] = await pool.execute(sql, values);
        const result = rows as T[];
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
};

// Função para INSERT, UPDATE, DELETE - retorna o resultado da operação
export const execute = async (sql: string, values?: any[]): Promise<QueryResultWithInsertId> => {
    try {
        const [result] = await pool.execute(sql, values);
        return result as QueryResultWithInsertId;
    } catch (error) {
        console.error('Erro na execução:', error);
        throw error;
    }
};

export default pool;