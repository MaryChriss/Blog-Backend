const express = require('express');
const router = express.Router();
const oracledb = require('../config/db').oracledb;

// Listar
router.get('/', async (req, res) => {
    let connection;
    try {
        console.log('Tentando conectar ao banco...');
        connection = await oracledb.getConnection();
        console.log('Conexão estabelecida.');
        
        const result = await connection.execute(`SELECT * FROM tb_posts`);

        // Processar CLOBs
        const processedRows = await Promise.all(
            result.rows.map(async (row) => {
                const bodyClob = row[3]; // Índice 3 corresponde ao campo BODY
                const body = bodyClob ? await bodyClob.getData() : null;

                return {
                    id_post: row[0],  // ID_POST
                    id_user: row[1],  // ID_USER
                    titulo: row[2],   // TITULO
                    body,             // BODY convertido de CLOB para string
                    created_at: row[4] // CREATED_AT
                };
            })
        );

        console.log('Dados processados:', processedRows);
        res.json(processedRows);
    } catch (err) {
        console.error('Erro ao executar consulta:', err);
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) {
            console.log('Fechando conexão...');
            await connection.close();
        }
    }
});

    // Create
    router.post('/', async (req, res) => {
    const { id_user, titulo, body } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
        `INSERT INTO tb_posts (id_user, titulo, body) VALUES (:id_user, :titulo, :body)`,
        [id_user, titulo, body],
        { autoCommit: true }
        );
        res.status(201).json({ id_post: result.lastRowid, id_user, titulo, body });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    //Buscar Por id
    router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT * FROM tb_posts WHERE id_post = :id`, [id]);
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    // Update
    router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, body } = req.body;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
        `UPDATE tb_posts SET titulo = :titulo, body = :body WHERE id_post = :id`,
        [titulo, body, id],
        { autoCommit: true }
        );
        if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
        }
        res.json({ message: 'Post atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
    });

    // Delete
    router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(`DELETE FROM tb_posts WHERE id_post = :id`, [id], {
        autoCommit: true,
        });
        if (result.rowsAffected === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;
