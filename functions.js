const { RichEmbed } = require("discord.js");
const isURL = require("is-url");
const colorChecker = require("css-color-checker");
const converter = require("hex2dec");
const { Collection } = require("discord.js");
const botSettings = require("./botSettings.json")

async function isMediaURL(string) {
    if(await !isURL(string)) return false;
    if(!string.endsWith(".gif") && 
        !string.endsWith(".jpg") && 
        !string.endsWith(".png") && 
        !string.endsWith(".jpeg") && 
        !string.endsWith(".gif/") && 
        !string.endsWith(".jpg/") && 
        !string.endsWith(".png/") && 
        !string.endsWith(".jpeg/")
    ) {
        return false;
    }
    return true;
}

module.exports.embed = {
    dimension: {
        // returns detailed RichEmbed of entered dimension™

        // FIND BY ID (D O N E)
        details: async (dimensionID, msg, client) => {
            const embed = new RichEmbed()

            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting details in \'functions.dimension.details().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                await msg.channel.send(embed);
                return;
            }
            
            // Dimension.findById(dimensionID, async (err, doc) => {
            //     if(err) {
            //         embed.setTitle("**Dimension is not in the database!!**")
            //         embed.setDescription("This may be an error, so you might want to contact the developer!")
            //         await msg.channel.send(embed);
            //         return;
            //     }
            //     if(doc) {
            //         if(isMediaURL(doc.graphic)) {
            //             embed.setImage(doc.graphic);
            //         }
            //         embed.setTitle("__**Dimension™ Details:**__");
            //         embed.setDescription("Here's a brief description of the dimension™:");
            //         embed.setThumbnail(doc.emoji.url)
            //         embed.setColor(doc.color);
            //         embed.addField("**Name**", doc.name);
            //         embed.addField("**Description**", doc.description);
            //         embed.addField("**Role**", `<@&${doc["_id"]}>`);
            //         await msg.channel.send(embed);
            //     }
            //     embed.setTitle("**Dimension is not in the database!!**")
            //     embed.setDescription("lmaooo rip xddd rawr :3")
            // })
            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not in the database!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                await msg.channel.send(embed);
                return;
            }
            // if(dimension) not necessary but it looks neater so rip
            if(dimension) {
                if(isMediaURL(dimension.graphic)) {
                    embed.setImage(dimension.graphic);
                }
                embed.setTitle("__**Dimension™ Details:**__");
                embed.setDescription("Here's a brief description of the dimension™:");
                embed.setThumbnail(dimension.emoji.url)
                embed.setColor(dimension.color);
                embed.addField("**Name**", dimension.name);
                embed.addField("**Description**", dimension.description);
                embed.addField("**Role**", `<@&${dimension["_id"]}>`);
                await msg.channel.send(embed);
            }
        },

        // FIND BY ID (D O N E)
        detailedDetails: async (dimensionID, msg, client) => {
            
            const embed = new RichEmbed();

            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting details in \'functions.dimension.details().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                await msg.channel.send(embed);
                return;
            }
            
            // Dimension.findById(dimensionID, async (err, doc) => {
            //     if(err) {
            //         embed.setTitle("**Dimension is not in the database!!**")
            //         embed.setDescription("This may be an error, so you might want to contact the developer!")
            //         await msg.channel.send(embed);
            //         return;
            //     }
            //     if(doc) {
            //         embed.setTitle("__**Dimension™ Details:**__");
            //         embed.setDescription("Here's a brief description of the dimension™:");
            //         embed.setThumbnail(doc.emoji.url)
            //         // check if doc.graphic is a url, so the app doesn't crash.
            //         if(isMediaURL(doc.graphic)){
            //             embed.setImage(doc.graphic);
            //         }
            //         embed.setColor(doc.color);
            //         embed.addField("**Name**", doc.name, true);
            //         embed.addField("**Role**", `<@&${doc["_id"]}>`, true);
            //         embed.addField("**Description**", doc.description);
            //         embed.addField("**Color #**", doc.color, true);
            //         embed.addField("**Emoji ID**", doc.emoji.id, true);
            //         var finalRolesString = "Roles: ";
            //         await doc.roles.forEach((roleID) => {
            //             finalRolesString += `<@&${roleID}>, `;
            //         })
            //         embed.addField("**Roles**", finalRolesString)
            //         await msg.channel.send(embed);
            //     }
            //     embed.setTitle("**Dimension is not in the database!!**")
            //     embed.setDescription("lmaooo rip xddd rawr :3")
            // })
            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not in the database!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                await msg.channel.send(embed);
                return;
            }
            // if(dimension) not necessary but it looks neater so rip
            if(dimension) {
                embed.setTitle("__**Dimension™ Details:**__");
                embed.setDescription("Here's a detailed description of the dimension™:");
                embed.setThumbnail(dimension.emoji.url)
                // check if doc.graphic is a url, so the app doesn't crash.
                if(isMediaURL(dimension.graphic)){
                    embed.setImage(dimension.graphic);
                }
                embed.setColor(dimension.color);
                embed.addField("**Name**", dimension.name, true);
                embed.addField("**Role**", `<@&${dimension["_id"]}>`, true);
                embed.addField("**Description**", dimension.description);
                embed.addField("**Color #**", dimension.color, true);
                embed.addField("**Emoji ID**", dimension.emoji.id, true);
                var finalRolesString = "Roles: ";
                await dimension.roles.forEach((roleID) => {
                    finalRolesString += `<@&${roleID}>, `;
                })
                embed.addField("**Roles**", finalRolesString)
                await msg.channel.send(embed);
            }
        }
    },
}

// all functions should include recaching data
module.exports.db = {
    add: async (client, schema, newData, failure, success) => {
        await schema.create(newData, async (err, docs) => {
            if(err) {
                if(failure) {
                    await failure(err);
                }
                return;
            }
            if(docs) {
                if(success) {
                    await success(docs);
                }
                // recache the collection
                await this.db.recache(client, schema, "\'add\'");
            }
        })
    },
    delete: {
        one: async (client, schema, filterData, failure, success) => {
            try {
                var doc = await schema.deleteOne(filterData);
            } catch (err) {
                if(failure) {
                    failure(err)
                }
            }
            if(doc) {
                if(success) {
                    success(doc);
                }
                // console.log("BEFORE RECACHE")
                // console.log(cache.array().length);
                await this.db.recache(client, schema, "\'delete one\'")
                // console.log("AFTER RECACHE")
                // console.log(cache.array().length);
            }
        },
        many: async (client, schema, filterData, failure, success) => {
            await schema.deleteMany(filterData, async (err, docs) => {
                if(err) {
                    if(failure) {
                        await failure(err);
                    }
                    return;
                }
                if(docs) {
                    if(success) {
                        await success(docs);
                    }
                    
                    // recache the data
                    await this.db.recache(client, schema, "\'delete many\'");
                }
            })
        },
    },
    update: {
        one: async (client, schema, filterData, updateData, failure, success) => {
            await schema.updateOne(filterData, updateData, async (err, doc) => {
                if(err) {
                    if(failure) {
                        await failure(err);
                    }
                    return;
                }
                if(doc) {
                    if(success) {
                        await success(doc)
                    }
                    // recache the collection
                    await this.db.recache(client, schema, "\'update one\'");
                }
            })
        },
        many: async (client, schema, filterData, updateData, failure, success) => {
            await schema.updateMany(filterData, updateData, async (err, docs) => {
                if(err) {
                    if(failure) {
                        await failure(err);
                    }
                    return;
                }
                if(docs) {
                    if(success) {
                        await success(docs)
                    }
                    // recache the collection
                    await this.db.recache(client, schema, "\'update many\'");
                }
            })
        }
    },

    // RECACHES USING ID AS KEY FOR COLLECTION ENTRIES
    // CONSIDER PASSING DATA FROM WITHIN EACH db METHOD. LIKE (schema, cache, >type<) and pass stuff like "add", "delete" from the functions above!
    recache: async (client, schema, crudType) => {

        try {
            var docs = await schema.find({});
        } catch (err) {
            console.log(`There was an issue trying to recache after the ${crudType} operation!`);
        }
        if(docs) {
            // console.log(client.cache[schema.collection.name].array().length);
            client.cache[schema.collection.name] = new Collection();
            await docs.forEach(doc => {
                client.cache[schema.collection.name].set(doc["_id"], doc);
            })
            // console.log(client.cache[schema.collection.name].array().length);
        }
    }
}


module.exports.toolkit = {
    isMediaURL,
    colorChecker,
    converter,
    botSettings
}