var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    logName: String,
    rfid: String,
    source: String,
    username: String,
    fullname: String,
    plateNumber: String,
    contact: String,
    time: String,
    date: String,
    prevBal: Number,
    currBal: Number,
    prevDebt: Number,
    currDebt: Number,
    amount: Number,
    initialLoad: Number,
    duration: Number,
    expiryTime: String,
    parkingFee: Number,
    slot: String,
    timeStamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);
