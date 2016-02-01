var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/sprint6');

module.exports = mongoose.model('Transaction', new mongoose.Schema({
    dev: String,
    date: {type: Date, default:Date.now},
    description: String,
    amount: Number
}));
