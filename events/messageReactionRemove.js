const botSettings = require("../botSettings.json");  
const functions = require("../functions.js");

module.exports.run = async (client, reaction, user) => {
    
    if (user.id === client.user.id) return;
    if (user.bot) return;
    if (client.indicators.teleporting.includes(user.id)) return;

    var teleportingTime = 20000;
    
    const rrmsg = client.cache.rrmessages.get(reaction.message.id);
    // is message a rrmessage?
    if(!rrmsg) return;

    // is the emote related to the rrmessage? (nothing random)
    const keys = Object.keys(rrmsg.reactionRoles);
    //? * The 'reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name' throughout this file is 
    //? * to make sure it works for both standard and custom emojis
    if(!keys.includes(reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name)) return;
         
    if(rrmsg.type == "normal") {
        try {
            await normalReaction(client, reaction, user, rrmsg);
            return;
        } catch (err) {
            console.log("there was an error trying to remove a role based on what emote they reacted in messageReactionAdd");
            functions.embed.errors.catch(err, client);
            reaction.remove(user);
            return;
        }
    }
}

module.exports.help = {
    name: "messageReactionRemove"
}

async function normalReaction(client, reaction, user, rrmsg) {
    await client.guilds.get(botSettings.guild).members.get(user.id).removeRole(rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name]);
}