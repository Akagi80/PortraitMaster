const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  // Błąd 2: długość tytułu oraz autora
  title: { type: String, required: true, maxlength: 25 },
  author: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true },
  src: { type: String, required: true },
  votes: { type: Number, required: true },
});

module.exports = mongoose.model('Photo', photoSchema);
