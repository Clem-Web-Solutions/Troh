const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Routes Import
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finances');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin}`);
    next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/folders', require('./routes/folders'));
app.use('/api/finances', financeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/phases', require('./routes/phases'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/amendments', require('./routes/amendments'));
app.use('/api/reserves', require('./routes/reserves'));

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Database Sync & Server Start
sequelize.sync({ alter: true }) // alter checks for current state and updates schema
    .then(() => {
        console.log('Database synchronized');

        // Init Cron Jobs
        const initPaymentAlerts = require('./cron/paymentAlerts');
        initPaymentAlerts();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });
