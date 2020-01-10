const { MessageEmbed } = require("discord.js");
const Role = require("../models/role.js");
const functions = require("../functions.js");

module.exports.run = async (msg, client, args) => {

    if(client.indicators.usingCommand.includes(msg.author.id)) {
        await msg.channel.send("You are already using a command (setup wizard, etc.). Finish that command before starting another one. B-BAKA!!!");
        return;
    }

    if(msg.channel.type == 'dm') return;
    
    client.indicators.usingCommand.push(msg.author.id);
    function removedID() {
        client.indicators.usingCommand = client.indicators.usingCommand.filter(user => user != msg.author.id)
    }

    switch (args[0]) {
        case "members":
            await functions.processes.scanMembers(client, msg);
            msg.channel.send("Scanned members!");
            removedID();
            break;
    }
}

module.exports.help = {
    name: "load"
}