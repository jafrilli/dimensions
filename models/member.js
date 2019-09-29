const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    _id: String,
    roles: Array,
})

module.exports = new mongoose.model('member', memberSchema, 'members');