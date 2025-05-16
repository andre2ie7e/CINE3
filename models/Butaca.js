const mongoose = require('mongoose');

const butacaSchema = new mongoose.Schema({
  butacas: [String],
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Butaca', butacaSchema);
