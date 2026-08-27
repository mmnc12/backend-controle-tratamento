import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuração para MySQL (Clever Cloud)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
    // Para Clever Cloud, SSL é necessário
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
});

export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        console.log(`📊 Host: ${process.env.DB_HOST || 'Clever Cloud'}`);
        console.log(`📊 Banco: ${process.env.DB_NAME || 'MySQL'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    }
};

// ============================================
// FUNÇÕES DE QUERY (MySQL)
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
        return (rows as any[]).length > 0 ? (rows as any[])[0] as T : null;
    } catch (error) {
        console.error('Erro na queryOne:', error);
        throw error;
    }
};

export const execute = async (sql: string, values?: any[]): Promise<any> => {
    try {
        const [result] = await pool.execute(sql, values);
        return {
            insertId: (result as any).insertId || 0,
            affectedRows: (result as any).affectedRows || 0,
            changedRows: (result as any).changedRows || 0
        };
    } catch (error) {
        console.error('Erro na execução:', error);
        throw error;
    }
};

export default pool;