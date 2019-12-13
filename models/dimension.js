const mongoose = require("mongoose");

const dimensionSchema = mongoose.Schema({
    _id: String,
    name: String,
    description: String,
    color: Number,
    password: String,
    dateCreated: Date,
    officerRole: String,
    emoji: {
        url: String,
        id: String,
        name: String
    },
    graphic: String,
    bans: Array,
    roles: Array,
    // extra
    welcome: {
        // to mention the user, use <<user>>
        channel: String,
        embed: {
            title: String,
            description: String,
            graphic: String,
            // footer: {
            //     text: String,
            //     icon: String,
            // }
        },

    }
})

module.exports = mongoose.model('dimension', dimensionSchema, 'dimensions');