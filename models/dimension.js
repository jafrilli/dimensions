const mongoose = require("mongoose");

const dimensionSchema = mongoose.Schema({
    _id: String,
    name: String,
    description: String,
    color: Number,
    emoji: {
        url: String,
        id: String,
        name: String
    },
    graphic: String,
    bans: Array,
    roles: Array
})

module.exports = mongoose.model('dimension', dimensionSchema, 'dimensions');