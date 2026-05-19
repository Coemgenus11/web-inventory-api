//src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const authRoutes = require('./routes/authRoutes'); // BAGO
const cashOutRoutes = require('./routes/cashOutRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes); // BAGO
app.use('/api', productRoutes);
app.use('/api', salesRoutes);
app.use('/api', cashOutRoutes);

app.get('/', (req, res) => res.json({ message: 'Inventory API running' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running sa http://localhost:${PORT}`));