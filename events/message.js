const botSettings = require("../botSettings.json");

module.exports.run = async (client, msg) => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(botSettings.prefix)) return;
    
    var command = msg.content.substring(botSettings.prefix.length).split(" ")[0];
    var args = msg.content.substring(botSettings.prefix.length).split(" ").slice(1);

    let cmd = client.commands.get(command);
    if(!cmd) return;
    cmd.run(msg, client, args);
}

module.exports.help = {
    name: "message"
}