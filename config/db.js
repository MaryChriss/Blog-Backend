const oracledb = require('oracledb');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    };

    async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Database connection pool started.');
    } catch (err) {
        console.error('Error initializing database pool:', err);
        process.exit(1);
    }
    }

    async function close() {
    try {
        await oracledb.getPool().close();
        console.log('Database connection pool closed.');
    } catch (err) {
        console.error('Error closing database pool:', err);
    }
}

module.exports = { initialize, close, oracledb: oracledb,
    config: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECTION_STRING,
    }, };
