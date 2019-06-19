const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    _id: String,
    tag: String,
    roles: Array,
})

module.exports = new mongoose.model('member', memberSchema, 'members');