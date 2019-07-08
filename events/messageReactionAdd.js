const botSettings = require("../botSettings.json");  

module.exports.run = async (client, reaction, user) => {
    
    if (user.id === client.user.id) return;
    
    const rrmsg = client.cache.rrmessages.get(reaction.message.id);
    // is message a rrmessage?
    if(!rrmsg) return;

    try {
        // check if message has that emote
        const keys = Object.keys(rrmsg.reactionRoles);
        if(!keys.includes(reaction.emoji.id)) {console.log("DOESNT HAVE IT..."); return;};
        // add role
        await client.guilds.get(botSettings.guild).members.get(user.id).addRole(rrmsg.reactionRoles[reaction.emoji.id])

    } catch (err) {
        console.log("there was an error trying to give a member a role based on what emote they reacted in messageReactionAdd");
    }
    // if(reaction.message.channel.id === botSettings.portal && reaction.message.embeds) {
    //}
}

module.exports.help = {
    name: "messageReactionAdd"
}