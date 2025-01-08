const express = require('express');
const router = express.Router();
const oracledb = require('../config/db').oracledb;

// Listar usuarios
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT * FROM tb_users`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    //Create
    router.post('/', async (req, res) => {
    const { username } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
        `INSERT INTO tb_users (username) VALUES (:username)`,
        [username],
        { autoCommit: true }
        );
        res.status(201).json({ id_user: result.lastRowid, username });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    //Buscar User por id
    router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT * FROM tb_users WHERE id_user = :id`, [id]);
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    //Update
    router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
        `UPDATE tb_users SET username = :username WHERE id_user = :id`,
        [username, id],
        { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'User não encontrado' });
        }
        res.json({ message: 'User atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    //Delete
    router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`DELETE FROM tb_users WHERE id_user = :id`, [id], {
        autoCommit: true,
        });
        if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'User não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
