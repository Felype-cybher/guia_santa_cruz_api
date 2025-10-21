const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const localRoutes = require('./routes/localRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 
app.use('/api/locais', localRoutes);

module.exports = app;
