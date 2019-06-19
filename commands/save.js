const Dimension = require("../models/dimension.js");
const Role = require("../models/role.js");

module.exports.run = async (msg, client, args) => {
    
    let newDimension = {
        _id: args[0],
        name: "New Dimension",
        role: "<#rolenumber>",
        roles: args
    }
    Dimension.create(newDimension, (err, doc) => {
        if(err) {
            console.log(err);
            return;
        }
        //console.log(doc);
        msg.channel.send("file has been saved to db!")
    })
}

module.exports.help = {
    name: "save"
}
