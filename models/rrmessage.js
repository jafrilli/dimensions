const mongoose = require("mongoose");

const rrSchema = mongoose.Schema({
    _id: String,
    // embed: {
    //     url: String,
    //     title: String,
    //     description: String,
    //     fields: Array,
    //     color: Number,
    //     thumbnail: String,
    //     graphic: String,
    //     footer: {
    //         text: String,
    //         icon: String
    //     }
    // },
    // content: String,
    type: String,
    reactionRoles: Object
})

module.exports = mongoose.model('rrmessage', rrSchema, 'rrmessages');