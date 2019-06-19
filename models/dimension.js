const mongoose = require("mongoose");

const dimensionSchema = mongoose.Schema({
    _id: String,
    name: String,
    role: String,
    color: Number,
    emote: String,
    roles: Array
})

module.exports = mongoose.model('dimension', dimensionSchema, 'dimensions');