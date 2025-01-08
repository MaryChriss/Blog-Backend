require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const loginRoutes = require('./routes/login');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/login', loginRoutes);

async function startServer() {
    try {
        await db.initialize();
        app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start the server:', err);
    }
    }

    startServer();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
    await db.close();
    process.exit(0);
});
