const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    _id: String,
    roles: Array,
    exp: Number,
    money: Number,

})

module.exports = new mongoose.model('member', memberSchema, 'members');