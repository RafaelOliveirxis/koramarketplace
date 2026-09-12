require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste da conexão com o MySQL
async function testarBanco() {
    try {
        const connection = await pool.getConnection();

        console.log('✅ MySQL conectado com sucesso!');
        console.log(`📦 Banco: ${process.env.DB_NAME}`);

        connection.release();
    } catch (error) {
        console.error('❌ Erro ao conectar ao MySQL:');
        console.error(error.message);
    }
}

// Rota principal
app.get('/', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: '🚀 API FlashMarket funcionando!',
        banco: 'MySQL'
    });
});

// Teste do banco
app.get('/api/teste-db', async (req, res) => {
    try {
        const [resultado] = await pool.query('SELECT 1 AS conectado');

        res.json({
            sucesso: true,
            mensagem: 'MySQL conectado corretamente!',
            resultado
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao conectar ao MySQL',
            erro: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log('');
    console.log('====================================');
    console.log('🚀 FLASHMARKET API');
    console.log('====================================');
    console.log(`🌐 Servidor: http://localhost:${PORT}`);
    console.log(`🗄️ Banco: ${process.env.DB_NAME}`);
    console.log('====================================');

    await testarBanco();
});