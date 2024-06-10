const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(mongoURL, {
    // useNewUrlParser: true,
    // useUnifideTopology: true
})
const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected to mongodb server');
})

db.on('error', (err) => {
    console.error('connection error', err);
})

db.on('disconnected',() => {
    console.log('disconnected to mongodb server');
})

module.exports = db;