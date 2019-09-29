const { RichEmbed } = require("discord.js");
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
        case "create": 
            break;
        case "delete":
            break;
        case "link":
            await rrLink(msg, client, args);
            removedID();
            break;
        default:    
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "rr"
}

async function rrLink(msg, client, args) {
    await functions.processes.refreshPortals(msg, client)
}