const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    _id: String,
    name: String,
})

module.exports = new mongoose.model('role', roleSchema, 'roles');