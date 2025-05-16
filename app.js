require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error de conexión:', err));

// Esquema de Mongoose
const butacaSchema = new mongoose.Schema({
  butacas: [String],
  fecha: { type: Date, default: Date.now }
});
const Butaca = mongoose.model('Butaca', butacaSchema);

// Swagger Config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Butacas de Cine',
      version: '1.0.0',
      description: 'API para registrar y consultar butacas seleccionadas',
    },
    servers: [
      { url: 'http://localhost:3030' },
      { url: 'https://cine3-production.up.railway.app/' }
    ]
  },
  apis: ['./app.js'], // Aquí busca los comentarios JSDoc
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/butacas/guardar:
 *   post:
 *     summary: Guardar butacas seleccionadas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               butacas:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               butacas: ["A1", "A2", "B5"]
 *     responses:
 *       200:
 *         description: Butacas guardadas correctamente
 */
app.post('/api/butacas/guardar', async (req, res) => {
  try {
    const nuevaReserva = new Butaca(req.body);
    await nuevaReserva.save();
    res.status(200).json({ message: 'Butacas guardadas correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar butacas' });
  }
});

/**
 * @swagger
 * /api/butacas:
 *   get:
 *     summary: Obtener todas las butacas guardadas
 *     responses:
 *       200:
 *         description: Lista de registros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   butacas:
 *                     type: array
 *                     items:
 *                       type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 */
app.get('/api/butacas', async (req, res) => {
  try {
    const registros = await Butaca.find();
    res.status(200).json(registros);
  } catch (error) {
    res.status(400).json({ message: 'Error al obtener registros' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
