const { RichEmbed } = require("discord.js");
const Dimension = require("./models/dimension.js");
const isMediaURL = require("./tools/isMediaUrl.js");

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
                    if(isMediaURL(doc.graphic)) {
                        embed.setImage(doc.graphic);
                    }
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
        },
        detailedDetails: async (dimensionID, msg) => {
            
            const embed = new RichEmbed();

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
                    // check if doc.graphic is a url, so the app doesn't crash.
                    if(isMediaURL(doc.graphic)){
                        embed.setImage(doc.graphic);
                    }
                    embed.setColor(doc.color);
                    embed.addField("**Name**", doc.name, true);
                    embed.addField("**Role**", `<@&${doc["_id"]}>`, true);
                    embed.addField("**Description**", doc.description);
                    embed.addField("**Color #**", doc.color, true);
                    embed.addField("**Emoji ID**", doc.emoji.id, true);
                    var finalRolesString = "Roles: ";
                    await doc.roles.forEach((roleID) => {
                        finalRolesString += `<@&${roleID}>, `;
                    })
                    embed.addField("**Roles**", finalRolesString)
                    await msg.channel.send(embed);
                }
                embed.setTitle("**Dimension is not in the database!!**")
                embed.setDescription("lmaooo rip xddd rawr :3")
            })
        }
    },
    functionTwo: (msg, client, args) => {},
}