var Member = require("../classes/member.js");
const botSettings = require("../botSettings.json");

module.exports.run = async (client, msg) => {
    if(msg.author.bot) return;
    // increase member's exp for every message by 5 (SYNCHRONOUS PROCESS, no await)
    var user = new Member(msg.author.id);
    user.changeExp(5);
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