const botSettings = require("../botSettings.json");  
const functions = require("../functions.js");

module.exports.run = async (client, reaction, user) => {

    if (user.id === client.user.id) return;
    if (user.bot) return;
    if (client.indicators.teleporting.includes(user.id)) return;

    var teleportingTime = botSettings.teleporting.time;
    
    const rrmsg = client.cache.rrmessages.get(reaction.message.id);
    // is message a rrmessage?
    if(!rrmsg) return;

    if(rrmsg.type == "stuck") {
        try {
            await stuckReaction(client, reaction, user, rrmsg);
            return;
        } catch (err) {
            functions.embed.errors.catch(err, client);
            reaction.users.remove(user);
            return;
        }
    }

    // is the emote related to the rrmessage? (nothing random)
    const keys = Object.keys(rrmsg.reactionRoles);
    //? * The 'reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name' throughout this file is 
    //? * to make sure it works for both standard and custom emojis
    if(!keys.includes(reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name)) return;
         

    if(rrmsg.type == "portal") {
        try {
            await portalReaction(client, reaction, user, rrmsg, teleportingTime);
            return;
        } catch (err) {
            console.log("there was an error trying to give a member a role based on what emote they reacted in messageReactionAdd");
            functions.embed.errors.catch(err, client);
            reaction.users.remove(user);
            return;
        }
    }
    
    if(rrmsg.type == "normal") {
        try {
            await normalReaction(client, reaction, user, rrmsg);
            return;
        } catch (err) {
            console.log("there was an error trying to give a member a role based on what emote they reacted in messageReactionAdd");
            functions.embed.errors.catch(err, client);
            reaction.users.remove(user);
            return;
        }
    }
}

module.exports.help = {
    name: "messageReactionAdd"
}

async function stuckReaction(client, reaction, user, rrmsg) {
    var dimensions = client.cache.dimensions.keyArray();
    var dimensionsUserIsIn = [];
    var dmCha = await user.createDM();
    var member = client.guilds.get(botSettings.guild).members.get(user.id);

    member.roles.forEach((role) => {
        if(dimensions.includes(role.id)) {
            dimensionsUserIsIn.push(role.id);
        } 
    });

    if(dimensionsUserIsIn.length <= 1) {
        dmCha.send("You're not in more than one dimensions smh!");
    } else {
        var dimensionsToRemove = dimensionsUserIsIn.slice(0, dimensionsUserIsIn.length-1);
        var member = client.guilds.get(botSettings.guild).members.get(user.id);
        await member.removeRoles(dimensionsToRemove);
        dmCha.send("You actually were in more than one dimensions! Fixed the issue!");
    }
    reaction.users.remove(user);
}

// ? like regular rr reaction, but has ban, cooldown, and password checks (very different)
async function portalReaction(client, reaction, user, rrmsg, teleportingTime) {

    // 1. if the user's last teleport is not saved in cache, then add user to cache
    if(!client.cache.members.get(user.id)) {
        client.cache.members.set(user.id, {lastTeleport: 0})
    }

    // 2. check if user's cooldown is over
    if(new Date() - client.cache.members.get(user.id).lastTeleport > teleportingTime) {
        
        // 3. checks if user is banned
        if(client.cache.dimensions.get(rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name]).bans.includes(user.id)) {
            var bannedEmbed = functions.embed.dimension.bannedEmbed(rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name], client);
            var dmCh = await user.createDM();
            reaction.users.remove(user);
            return dmCh.send(bannedEmbed);
        }

        // 4. check if user needs password
        var authorized = await functions.processes.requestPassword(client,user,rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name]);
        if(authorized) {
            await client.guilds.get(botSettings.guild).members.get(user.id).roles.add(rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name]);
        }

    } else {
        // if user teleport cooldown is not over
        var dmChannel = await user.createDM();
        await dmChannel.send(
            "You need to wait " + 
            Math.round((teleportingTime - (new Date() - client.cache.members.get(user.id).lastTeleport))/1000) + 
            " seconds before you can teleport again ;-;"
        );
    }

    // remove the reaction
    reaction.users.remove(user);
}

async function normalReaction(client, reaction, user, rrmsg) {
    await client.guilds.get(botSettings.guild).members.get(user.id).roles.add(rrmsg.reactionRoles[reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name]);
}