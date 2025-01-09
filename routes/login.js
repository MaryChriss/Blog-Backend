const express = require('express');
const router = express.Router();
const oracledb = require('../config/db').oracledb;

// Listar logins
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT * FROM tb_login_users`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

// Inserir login
router.post('/', async (req, res) => {
    const { id_user, email_login, senha_login } = req.body;
    let connection;

    if (!id_user|| !email_login || !senha_login) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        connection = await oracledb.getConnection();

        const result = await connection.execute(
            `INSERT INTO tb_login_users (id_user, email_login, senha_login) 
                VALUES (:id_user, :email_login, :senha_login) 
                RETURNING id_login INTO :id_login`,
            {
                id_user,
                email_login,
                senha_login,
                id_login: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            },
            { autoCommit: true }
        );

        const id_login = result.outBinds.id_login[0];

        res.status(201).json({
            message: 'Login criado com sucesso!',
            id_login,
            id_user,
            email_login,
        });
    } catch (err) {
        console.error('Erro ao inserir login:', err);
        res.status(500).json({ error: 'Erro ao criar login', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

// Buscar login por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT * FROM tb_login_users WHERE id_login = :id`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Login not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

// Atualizar login
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { email_login, senha_login } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `UPDATE tb_login_users 
                SET email_login = :email_login, senha_login = :senha_login 
                WHERE id_login = :id`,
            [email_login, senha_login, id],
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Login não encontrado' });
        }
        res.json({ message: 'Login atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

// Deletar login
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `DELETE FROM tb_login_users WHERE id_login = :id`,
            [id],
            { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Login não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

// Autenticar login
router.post('/auth', async (req, res) => {
    const { email_login, senha_login } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT * FROM tb_login_users WHERE email_login = :email_login AND senha_login = :senha_login`,
            [email_login, senha_login]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais invalidas' });
        }

        const login = result.rows[0];
        res.json({
            id_login: login.ID_LOGIN,
            id_user: login.ID_USER,
            email_login: login.EMAIL_LOGIN
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
