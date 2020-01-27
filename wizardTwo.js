const { MessageEmbed, Collection } = require("discord.js");
const functions = require("./functions.js");
const botSettings = require("./botSettings.json");

var response = {
    success: true,
    message: "",
}

module.exports = 

// ! THIS IS A PROJECT IN THE WORKS FOR v0.10.0
// testing outlet is >rr delete

class Wizard {

    constructor() {
        /* format:
            {
                embed: new MessageEmbed,
                condition: function(message),
                post: function(index of the current node)
            }
        */
        this.sequence = [];
    }

    async addTextNode(embed, attemptEmbed, skip, skipValue, condition, postFunc) {
        this.sequence.push({
            embed, 
            attemptEmbed,
            skip,
            skipValue,
            condition,
            postFunc
        })
    }

    // used for upsert to user processes.
    async addColorNode(embed) {
       
    }

    async addCollectorNode() {

    }

    collectNode(message, node) {
        return new Promise((resolve, reject) => {
            var collector = message.createMessageCollector(m => m.author.id === msg.author.id, {time: 5000, errors: ['time']});
            collector.on('collect', async (m) => {
                if(m.content.toLowerCase() == 'quit') reject('quit');
                if(m.content.toLowerCase() == 'skip' && node.skip) resolve(node.skipValue);
                var item = await node.condition(m);
                resolve(item);
            });
            collector.on('end', (collected, reason) => {
                if(reason == 'time') reject('time');
            })
        })
    }

    async run(msg, client) {
        var responses = []
        var message = await msg.channel.send('Starting Wizard...');
        for(var i = 0; i < this.sequence.length; i++) {
            var node = this.sequence[i];
            var embed = new MessageEmbed(node.embed);
            await message.edit(embed);
            try{
                var response = await this.collectNode(message, node);
            } catch (err) {
                switch (err) {
                    case 'quit':
                        return false;
                    case 'time':
                        return msg.channel.send("You're out of time");
                }
            }
            responses.push(response);
            await node.postFunc(i, responses);
        }
        return responses;
    }
}


/*
    return format
    {
        success: true, //required
        message: "Message" //optional
    }
*/