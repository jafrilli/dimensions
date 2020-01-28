const { MessageEmbed, Collection } = require("discord.js");
const functions = require("./functions.js");
const botSettings = require("./botSettings.json");

/*
    ! initialEmbed & attemptedEmbed object format
    {
        title: "",
        description: "",
        footer: {
            text: "",
            icon: ""
        }
    }
*/
// * This time limit is linked to all these wizard nodes
const timeLimit = 15000;

function checkEmbed(skippable, initialEmbed, attemptedEmbed) {
    if(!initialEmbed.footer) {
        initialEmbed.footer = {
            text: skippable ? "Type \'skip\' to skip this step, or \'quit\' to quit wizard..." : "Type \'quit\' to quit wizard...",
            icon: null
        }
    }
    if(!initialEmbed.footer.icon) {
        initialEmbed.footer.icon = null;
    }
    if(!attemptedEmbed) {
        var attemptedEmbed = initialEmbed;
    }
    if(!attemptedEmbed.footer) {
        attemptedEmbed.footer = {
            text: skippable ? "Type \'skip\' to skip this step, or \'quit\' to quit wizard..." : "Type \'quit\' to quit wizard...",
            icon: null
        }
    }
    return {
        initial: initialEmbed,
        attempted: attemptedEmbed
    }
}

module.exports.default = async (msg, client, skippable, skipValue, initialEmbed, condition, attemptedEmbed) => {
    var attempted = false;
    var checkedEmbeds = checkEmbed(skippable, initialEmbed, attemptedEmbed);
    initialEmbed = checkedEmbeds.initial;
    attemptedEmbed = checkedEmbeds.attempted;
    do {
        await msg.channel.send(new MessageEmbed({
            title: attempted ? attemptedEmbed.title : initialEmbed.title, 
            description: attempted ? attemptedEmbed.description : initialEmbed.description, 
            footer: {
                text: attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text,
                icon: attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon,
            }
        }));
        try {
            var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
        } catch(err) {
            msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
            return false;
        }
        // built-in quit detector
        if(response.first().content.toLowerCase() === "quit") {msg.channel.send("You quit the wizard."); return false;}
        
        if(skippable) {
            if(response.first().content.toLowerCase() === "skip") {return skipValue;}
        }
        // condition should return what it wants
        var item = await condition(response.first());

        attempted = true;
    } while (!item)

    return item;
}

module.exports.type = {
    text: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
        var res = await this.default(
            msg, 
            client, 
            skippable, 
            skipValue,
            initialEmbed,
            (response) => {
                if(typeof response.content == 'string') {
                    return response.content;
                }
            },
            attemptedEmbed
        )
        return res;
    },
    color: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
        var res = await this.default(
            msg, 
            client, 
            skippable, 
            skipValue,
            initialEmbed,
            (response) => {
                if(functions.toolkit.colorChecker.isHexColor(response.content)) {
                    return response.content;
                }
            },
            attemptedEmbed
        )
        return res;
    },
    graphic: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
        var res = await this.default(
            msg, 
            client, 
            skippable, 
            skipValue,
            initialEmbed,
            async (response) => {
                var isMedia = await functions.toolkit.isMediaURL(response.content.toString())
                if(isMedia) {
                    console.log(response.content)
                    return response.content;
                }
            },
            attemptedEmbed
        )
        return res;
    },
    reaction: async (msg, client, initialEmbed, attemptedEmbed) => {
        var attempted = false
        do {
            var emojiRequest = await msg.channel.send(new MessageEmbed({
                title: attempted ? attemptedEmbed.title : initialEmbed.title, 
                description: attempted ? attemptedEmbed.description : initialEmbed.description, 
                footer: {
                    text: "You CANNOT quit here. React with SOMETHING at least, just to move on. Still working on making it possible to quit here...",
                    icon: null
                }
            }));
            try{
                var reactedEmote = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            attempted = true
        } while (!reactedEmote.first().emoji.id && !reactedEmote.first().emoji.url)
        return {
            id: reactedEmote.first().emoji.id,
            url: reactedEmote.first().emoji.url,
            name: reactedEmote.first().emoji.name
        };
    },
    dimension: async (msg, client, initialEmbed, attemptedEmbed) => {
        var skippable = false;
        var checkedEmbeds = checkEmbed(skippable, initialEmbed, attemptedEmbed);
        initialEmbed = checkedEmbeds.initial;
        attemptedEmbed = checkedEmbeds.attempted;

        var allDimensions = [];
        const embedOne = new MessageEmbed();
        
        await client.cache.dimensions.array().forEach((dimension, ind) => {
            allDimensions.push(dimension["_id"]);
            embedOne.addField(`\`${ind+1}.\`  **${dimension.name}**`, `<@&${dimension["_id"]}>`);
        })
            
        var attempted = false;
        do {
            embedOne.setTitle(attempted ? attemptedEmbed.title : initialEmbed.title);
            embedOne.setDescription(attempted ? attemptedEmbed.description : initialEmbed.description);
            embedOne.setFooter(attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text, attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon);
            await msg.channel.send(embedOne);
            try {
                var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            if(response.first().content === "quit") { return false; }
            console.log(allDimensions[parseInt(response.first().content-1)]);
            attempted = true;
        // } while (!Object.keys(allDimensions).includes(response.first().content))
        } while (!allDimensions[parseInt(response.first().content)-1])
    
        return allDimensions[parseInt(response.first().content)-1];
    },
    // ! DO NOT USE dimensionRole() FOR ANYTHING EXCEPT >dimension deleteRoles. IT HAS A 'done' LISTENER
    dimensionRole: async (msg, client, dimensionID, initialEmbed, attemptedEmbed) => {
        var skippable = false;
        var checkedEmbeds = checkEmbed(skippable, initialEmbed, attemptedEmbed);
        initialEmbed = checkedEmbeds.initial;
        attemptedEmbed = checkedEmbeds.attempted;

        const embedOne = new MessageEmbed();
        var allDimensionRoles = [];
        
        await client.cache.dimensions.get(dimensionID).roles.forEach((role, ind) => {
            var roleName = client.guilds.get(botSettings.guild).roles.get(role).name
            allDimensionRoles.push(role);
            embedOne.addField(`\`${ind+1}.\`  **${roleName}**`, `<@&${role}>`)
        })
            
        var attempted = false;
        do {
            embedOne.setTitle(attempted ? attemptedEmbed.title : initialEmbed.title);
            embedOne.setDescription(attempted ? attemptedEmbed.description : initialEmbed.description);
            embedOne.setFooter(attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text, attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon);
            await msg.channel.send(embedOne);
            try {
                var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            // built-in quit detector
            if(response.first().content === "quit") {return false;}
            
            attempted = true;
        } while (!allDimensionRoles[parseInt(response.first().content)-1] && response.first().content != "done")

        
        return response.first().content.toString().toLowerCase() == "done" ? response.first() : allDimensionRoles[parseInt(response.first().content)-1];
    },
    // * This is what to use for almost all dimension role selection tasks
    positionedDimensionRole: async (msg, client, dimensionID, initialEmbed, attemptedEmbed) => {
        var skippable = false;
        var checkedEmbeds = checkEmbed(skippable, initialEmbed, attemptedEmbed);
        initialEmbed = checkedEmbeds.initial;
        attemptedEmbed = checkedEmbeds.attempted;

        const embedOne = new MessageEmbed();
        var allDimensionRoles = [];
        var dimensionRoles = client.cache.dimensions.get(dimensionID).roles;
        
        await dimensionRoles.forEach(roleID => {
            var role = client.guilds.get(botSettings.guild).roles.get(roleID);
            allDimensionRoles.push({
                id: roleID,
                name: role.name,
                position: role.position,
                calculatedPosition: role.calculatedPosition
            });
        })

        allDimensionRoles.sort((a, b) => a.position - b.position);
        allDimensionRoles.reverse();

        allDimensionRoles.forEach((rlObj, ind) => {
            embedOne.addField(`\`${ind+1}.\`  **${rlObj.name}**`, `<@&${rlObj.id}>`)
        })
            
        var attempted = false;
        do {
            embedOne.setTitle(attempted ? attemptedEmbed.title : initialEmbed.title);
            embedOne.setDescription(attempted ? attemptedEmbed.description : initialEmbed.description);
            embedOne.setFooter(attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text, attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon);
            await msg.channel.send(embedOne);
            try {
                var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            // built-in quit detector
            if(response.first().content.toLowerCase() === "quit") {return false;}
            
            attempted = true;
        } while (!allDimensionRoles[parseInt(response.first().content)-1])

        return allDimensionRoles[parseInt(response.first().content)-1];
    },
    userDimensionRoles: async (msg, client, dimensionID, userID, initialEmbed, attemptedEmbed) => {
        var skippable = false;
        var checkedEmbeds = checkEmbed(skippable, initialEmbed, attemptedEmbed);
        initialEmbed = checkedEmbeds.initial;
        attemptedEmbed = checkedEmbeds.attempted;

        const embedOne = new MessageEmbed();
        var allUserDimensionRoles = [];
        var dimensionRoles = client.cache.dimensions.get(dimensionID).roles;
        var userRoles = msg.guild.members.get(userID).roles;
        
        await userRoles.forEach(role => {
            
            if(dimensionRoles.includes(role.id)) {
                allUserDimensionRoles.push({
                    id: role.id,
                    name: role.name,
                    position: role.position,
                    calculatedPosition: role.calculatedPosition
                });
            }
        })

        allUserDimensionRoles.sort((a, b) => a.position - b.position);
        allUserDimensionRoles.reverse();

        allUserDimensionRoles.forEach((rlObj, ind) => {
            embedOne.addField(`\`${ind+1}.\` **${rlObj.name}**`, `<@&${rlObj.id}>`)
        })

        var attempted = false;
        do {
            embedOne.setTitle(attempted ? attemptedEmbed.title : initialEmbed.title);
            embedOne.setDescription(attempted ? attemptedEmbed.description : initialEmbed.description);
            embedOne.setFooter(attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text, attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon);
            await msg.channel.send(embedOne);
            try {
                var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            // built-in quit detector
            if(response.first().content.toLowerCase() === "quit") {return false;}
            
            attempted = true;
        } while (!allUserDimensionRoles[parseInt(response.first().content)-1])

        return allUserDimensionRoles[parseInt(response.first().content)-1];
    },
    yesno: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
        var res = await this.default(
            msg, 
            client, 
            skippable, 
            skipValue,
            initialEmbed,
            (response) => {
                if(typeof response.content == 'string') {
                    if(response.content.toLowerCase() == 'yes' || response.content.toLowerCase() == 'no') {
                        return response.content;
                    }
                }
            },
            attemptedEmbed
        )
        return res;
    },
    mention: {
        channel: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
            var res = await this.default(
                msg, 
                client, 
                skippable, 
                skipValue,
                initialEmbed,
                (response) => {
                    if(response.mentions.channels.array().length > 0) {
                        return response.mentions.channels.first();
                    }
                },
                attemptedEmbed
            )
            return res;
        },
        user: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
            var res = await this.default(
                msg, 
                client, 
                skippable, 
                skipValue,
                initialEmbed,
                (response) => {
                    if(response.mentions.users.array().length > 0) {
                        return response.mentions.users.first();
                    }
                },
                attemptedEmbed
            )
            return res;
        },
        role: async (msg, client, skippable, skipValue, initialEmbed, attemptedEmbed) => {
            var res = await this.default(
                msg, 
                client, 
                skippable, 
                skipValue,
                initialEmbed,
                (response) => {
                    if(response.mentions.roles.array().length > 0) {
                        return response.mentions.roles.first();
                    }
                },
                attemptedEmbed
            )
            return res;
        },
    },
    // special
    confirmation: async (msg, client, initialText, attemptedText, midConfirmationCB) => {
        var attempted = false;
        do {
            var confirmMessage = attempted ? attemptedText : initialText;
            await msg.channel.send(confirmMessage);
            if(midConfirmationCB) await midConfirmationCB(msg, client, attempted);
            try {
                var confirmation = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: timeLimit, errors: ['time']})
            } catch(err) {
                msg.channel.send('⏰ You ran out of time (+' + timeLimit/1000 + ' seconds)! Ending wizard...');
                return false;
            }
            if(confirmation.first().content === "quit") { return false; }
            attempted = true;
        } while (confirmation.first().content.toLowerCase() != "confirm")

        return true;
    }
}