const { RichEmbed } = require("discord.js");
const Dimension = require("./models/dimension.js");

module.exports = {
    dimension: {
        // returns detailed RichEmbed of entered dimension™
        details: async (dimensionID, msg) => {
            const embed = new RichEmbed()

            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting details in \'functions.dimension.details().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                await msg.channel.send(embed);
                return;
            }
            
            Dimension.findById(dimensionID, async (err, doc) => {
                if(err) {
                    embed.setTitle("**Dimension is not in the database!!**")
                    embed.setDescription("This may be an error, so you might want to contact the developer!")
                    await msg.channel.send(embed);
                    return;
                }
                if(doc) {
                    embed.setTitle("__**Dimension™ Details:**__");
                    embed.setDescription("Here's a brief description of the dimension™:");
                    embed.setThumbnail(doc.emoji.url)
                    embed.setColor(doc.color);
                    embed.addField("**Name**", doc.name);
                    embed.addField("**Description**", doc.description);
                    embed.addField("**Role**", `<@&${doc["_id"]}>`);
                    await msg.channel.send(embed);
                }
                embed.setTitle("**Dimension is not in the database!!**")
                embed.setDescription("lmaooo rip xddd rawr :3")
            })
        }
    },
    functionTwo: (msg, client, args) => {},
}