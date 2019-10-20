const botSettings = require("../botSettings.json");  
const functions = require("../functions.js");

module.exports.run = async (client, reaction, user) => {
    
    if (user.id === client.user.id) return;
    if (user.bot) return;
    if (client.indicators.teleporting.includes(user.id)) return;

    
    const rrmsg = client.cache.rrmessages.get(reaction.message.id);
    // is message a rrmessage?
    if(!rrmsg) return;

    try {
        // check if message has that emote
        const keys = Object.keys(rrmsg.reactionRoles);
        if(!keys.includes(reaction.emoji.id)) {console.log("DOESNT HAVE IT..."); return;};
        
        // check if the cooldown is finished (10 seconds)
        if(new Date() - client.cache.members.get(user.id).lastTeleport > 15000) {
            var authorized = await functions.processes.requestPassword(client,user,rrmsg.reactionRoles[reaction.emoji.id]);

            if(authorized) {
                await client.guilds.get(botSettings.guild).members.get(user.id).addRole(rrmsg.reactionRoles[reaction.emoji.id]);

            }
        } else {
            console.log(new Date() - client.cache.members.get(user.id).lastTeleport);
            var dmChannel = await user.createDM();
            await dmChannel.send(
                "You need to wait " + 
                Math.round((15000 - (new Date() - client.cache.members.get(user.id).lastTeleport))/1000) + 
                " seconds before you can teleport again ;-;"
            );
        }

        // remove the reaction
        reaction.remove(user);
        
    } catch (err) {
        console.log("there was an error trying to give a member a role based on what emote they reacted in messageReactionAdd");
        functions.embed.errors.catch(err, client);
        
        // remove the reaction
        reaction.remove(user);
    }
    // if(reaction.message.channel.id === botSettings.portal && reaction.message.embeds) {
    //}
}

module.exports.help = {
    name: "messageReactionAdd"
}