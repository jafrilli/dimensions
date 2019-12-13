const { RichEmbed } = require("discord.js");
const functions = require("./functions.js");

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

module.exports.default = async (msg, client, skippable, skipValue, initialEmbed, condition, attemptedEmbed) => {
    var attempted = false;
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
    do {
        await msg.channel.send(new RichEmbed({
            title: attempted ? attemptedEmbed.title : initialEmbed.title, 
            description: attempted ? attemptedEmbed.description : initialEmbed.description, 
            footer: {
                text: attempted ? attemptedEmbed.footer.text : initialEmbed.footer.text,
                icon: attempted ? attemptedEmbed.footer.icon : initialEmbed.footer.icon,
            }
        }));
        try {
            var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            functions.embed.errors.catch(err, client);
        }
        // built-in quit detector
        if(response.first().content === "quit") {msg.channel.send("You quit the wizard."); return false;}
        
        if(skippable) {
            if(response.first().content === "skip") {return skipValue;}
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
            var emojiRequest = await msg.channel.send(new RichEmbed({
                title: attempted ? attemptedEmbed.title : initialEmbed.title, 
                description: attempted ? attemptedEmbed.description : initialEmbed.description, 
                footer: {
                    text: "You CANNOT quit here. React with SOMETHING at least, just to move on. Still working on making it possible to quit here...",
                    icon: null
                }
            }));
            try{
                var reactedEmote = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1});
            }catch(err){
                functions.embed.errors.catch(err, client);
            }
            attempted = true
        } while (!reactedEmote.first().emoji.id && !reactedEmote.first().emoji.url)
        return {
            id: reactedEmote.first().emoji.id,
            url: reactedEmote.first().emoji.url,
            name: reactedEmote.first().emoji.name
        };
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
            await midConfirmationCB(msg, client, attempted);
            try {
                var confirmation = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
            } catch(err) {
                console.log("ERROR CONFIRMING THE POSTING OF AN ANNOUNCEMENT: \n" + err)
            }
            if(confirmation.first().content === "quit") { return false; }
            attempted = true;
        } while (confirmation.first().content.toLowerCase() != "confirm")

        return true;
    }
}