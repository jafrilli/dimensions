const { RichEmbed, Collection } = require("discord.js");
const isURL = require("is-url");
const colorChecker = require("css-color-checker");
const converter = require("hex2dec");
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

        //TODO: Make this return an embed WITHOUT the use of 'msg'
        // returns an embed, unlike details and detailedDetails
        portalDetails: async (dimensionID, msg, client) => {
            const embed = new RichEmbed()

            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting details in \'functions.dimension.details().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                await msg.channel.send(embed);
                return;
            }
            
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
                embed.setTitle(`__**${dimension.name}**__`)
                // embed.setTitle("__**Dimension™ Details:**__");
                embed.setDescription("Here's a brief description of the dimension™:");
                embed.setThumbnail(dimension.emoji.url)
                embed.setColor(dimension.color);
                // embed.addField("**Name**", dimension.name);
                embed.addField("**Description**", dimension.description);
                embed.addField("**Role**", `<@&${dimension["_id"]}>`);
                embed.addField(dimension.password ? "🔒" : "🔓", dimension.password ? "Locked" : "Open");
                if(dimension.officerRole) { 
                    embed.addField("**Officer Role**",  `<@&${dimension.officerRole}>`);
                }
                var finalRolesString = "";
                await dimension.roles.forEach((roleID) => {
                    finalRolesString += `<@&${roleID}>, `;
                })
                embed.addField("**Obtainable Roles**", finalRolesString != "" ? finalRolesString : "No Roles...")
                return {
                    embed: embed, 
                    emoji: dimension.emoji,
                    role: dimension["_id"]
                };
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
                embed.addField("**Officer Role**", dimension.officerRole ? `<@&${dimension.officerRole}>` : "No Officer Role")
                var finalRolesString = "Roles: ";
                await dimension.roles.forEach((roleID) => {
                    finalRolesString += `<@&${roleID}>, `;
                })
                embed.addField("**Roles**", finalRolesString)
                await msg.channel.send(embed);
            }
        },

        // announcementObject should look like this
        /*
            {
                text: "",
                graphic: ""
            }
        */
        announcementEmbed: async (dimensionID, msg, client, announcementObject) => {
            const embed = new RichEmbed();

            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting details in \'functions.dimension.details().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                await msg.channel.send(embed);
                return;
            }

            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not in the database!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                await msg.channel.send(embed);
                return;
            }
            // if(dimension) not necessary but it looks neater so rip
            if(dimension) {
                embed.setTitle(`__**Announcement from ${dimension.name}™:**__`);
                embed.setThumbnail(dimension.emoji.url);
                if(announcementObject.text) {
                    embed.setDescription(announcementObject.text);
                }
                // check if doc.graphic is a url, so the app doesn't crash.
                if(announcementObject.graphic) {
                    if(isMediaURL(announcementObject.graphic)){
                        embed.setImage(announcementObject.graphic);
                    }
                }
                embed.setColor(dimension.color);
            }
            return embed;
        },
        // an embed for password requests
        // UNLIKE THE OTHERS, PASSWORD REQUEST >>>>RETURNS AN EMBED<<<<, DOESNT SEND IT FOR YOU
        passwordRequest: async (dimensionID, client) => {
            var embed = new RichEmbed();
            
            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting embed from \'functions.dimension.passwordRequest().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                return embed;
            }

            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not saved in cache!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                return embed;
                
            }

            // if(dimension) not necessary but it looks neater so rip
            if(dimension) {
                embed.setTitle("__**Dimension™ Password 🔑:**__");
                embed.setDescription("Enter the dimension™ password to be authorized access:");
                embed.setThumbnail(dimension.emoji.url);
                embed.setColor(dimension.color)
                // check if doc.graphic is a url, so the app doesn't crash.
                if(isMediaURL(dimension.graphic)){
                    embed.setImage(dimension.graphic);
                }

                return embed;
            }
        },

        bannedEmbed: (dimensionID, client) => {
            var embed = new RichEmbed();
            
            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting embed from \'functions.dimension.bannedEmbed().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                return embed;
            }

            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not saved in cache!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                return embed;
                
            }

            // if(dimension) not necessary but it looks neater so rip
            if(dimension) {
                embed.setTitle("__**Dimension™ Notification: You've been banned!**__");
                embed.setDescription("Damn, you got banned! Feel free to talk to an officer to explain your situation. The officers __should__ be open minded! - **Overlords**");
                embed.setThumbnail(dimension.emoji.url);
                embed.setColor(dimension.color)
                // check if doc.graphic is a url, so the app doesn't crash.
                if(isMediaURL(dimension.graphic)){
                    embed.setImage(dimension.graphic);
                }

                return embed;
            }
        },

        welcomeEmbed: (dimensionID, client, member) => {
            var dimension = client.cache.dimensions.get(dimensionID);
            
            var embed = new RichEmbed();
            
            // check if dimensionID is the correct format
            if(typeof dimensionID !== 'string') {
                embed.setTitle("**Error retrieving data!**")
                embed.setDescription("Error getting embed from \'functions.dimension.welcomeEmbed().\' DimensionID was not a string! ME SAD ;-;! Contact developer!")
                return embed;
            }

            var dimension = client.cache.dimensions.get(dimensionID);
            if(!dimension) {
                embed.setTitle("**Dimension is not saved in cache!!**")
                embed.setDescription("This may be an error, so you might want to contact the developer!")
                return embed;
                
            }

            // if(dimension) not necessary but it looks neater so rip
            if(dimension.welcome) {
                embed.setTitle(dimension.welcome.embed.title ? dimension.welcome.embed.title.replace("<<user>>", member.user.username) : null,);
                embed.setDescription(dimension.welcome.embed.description ? dimension.welcome.embed.description.replace("<<user>>", `<@${member.id}>`) : null);
                embed.setThumbnail(member.user.avatarURL);
                embed.setColor(dimension.color)
                // check if doc.graphic is a url, so the app doesn't crash.
                if(isMediaURL(dimension.welcome.embed.graphic)){
                    embed.setImage(dimension.welcome.embed.graphic);
                }

                return embed;
            }
        }
    },
    errors: {
        catch: async (err, client) => {
            var embed = new RichEmbed();
            embed.setTitle("Try/Catch Error @ " + err.stack.substring(0,200));
            embed.addField("Error Type", err.name.substring(0,200));
            embed.addField("Error Description", err.message.substring(0,200));
            
            client.guilds.get(botSettings.guild).channels.get(botSettings.error).send(embed);
        }
    }
}

module.exports.processes = {
    refreshPortals: async (msg, client) => {

        const portal = client.guilds.get(botSettings.guild).channels.get(botSettings.portal);

        // 1. delete all the dimension msgs
        const msgsToDelete = await portal.fetchMessages()
        await portal.bulkDelete(msgsToDelete.filter(message => message.author.id == client.user.id));

        const dimensions = await client.cache.dimensions.array()
        const rrs = []
        
        for (var i = 0; i < dimensions.length; i++) {
            const dimensionDetails = await this.embed.dimension.portalDetails(dimensions[i]["_id"], msg, client);
            var reactionRole = {};
            
            const sentEmbed = await portal.send(dimensionDetails);
            reactionRole["_id"] = sentEmbed.id
            reactionRole.type = "portal"
            reactionRole.reactionRoles = {}
            reactionRole.reactionRoles[dimensionDetails.emoji.id] = dimensionDetails.role;
            rrs.push(reactionRole)
            // console.log(reactionRole)
            sentEmbed.react(dimensionDetails.emoji.id);
        }
        // console.log(rrs)
        
        await this.db.delete.many(
            client,
            client.models.rrmessage,
            {type: "portal"},
            (err) => {console.log("There was an error trying to delete portal reaction role data in refreshPortals")},
            (docs) => {}
        )
        

        await this.db.add(
            client,
            client.models.rrmessage,
            rrs,
            (err) => {console.log("There was an error trying to add portal reaction role data in refreshPortals")},
            (docs) => {}
        )
    },
    teleport: async (client, dimensionID, oldMember, newMember) => {

        // if they arent on the list then add them
        if(client.indicators.teleporting.includes(oldMember.user.id)) return;
        client.indicators.teleporting.push(oldMember.user.id);
        // give teleporting role
        const member = client.guilds.get(botSettings.guild).members.get(oldMember.user.id);
        await member.addRole(botSettings.teleporting.role);
        
        var dimensionsIDs = client.cache.dimensions.keyArray();
        // should i use newMember instead? EXCLUDE @EVERYONE

        // info about the previous dimension (its id and possible roles)
        var previousDimensionID = oldMember.roles.keyArray().filter(r => dimensionsIDs.includes(r)); 
        var previousDimensionRoles; 
        if(client.cache.dimensions.get(previousDimensionID[0])) {
            if(client.cache.dimensions.get(previousDimensionID[0]).roles) {
              previousDimensionRoles = client.cache.dimensions.get(previousDimensionID[0]).roles;
            }
            else {
                previousDimensionRoles = [];
            }
        }
        else {
            previousDimensionRoles = [];
        }
        // gets the user's previous roles (not dimension roles) and previous dimension-specific roles
        var previousRoles = oldMember.roles.keyArray().filter((role) => !dimensionsIDs.includes(role));
        var prs = previousRoles.filter((pr) => previousDimensionRoles.includes(pr));

        // 1. delete roles for that dimension on the database, and replace with these new ones

        var memberData;
        try {
            await client.models.member.findOne({_id: oldMember.user.id}, (err, doc) => {
                if(doc) {
                    // console.log(doc);
                    doc.roles = doc.roles ? doc.roles : [];
                    memberData = doc;
                } else {
                    memberData = {
                        "_id": oldMember.user.id,
                        roles: []
                    }
                }
                if(err) console.log(err);
            })
        } catch (error) {
            this.embed.errors.catch(error, client);
            memberData = {
                "_id": oldMember.user.id,
                roles: []
            }
        }

        if(memberData) {
            if(memberData.roles) {
                var withoutPreviousDimensionRoles = memberData.roles.filter((r) => !previousDimensionRoles.includes(r));
                var newMemberRoles = withoutPreviousDimensionRoles.concat(prs);
            }
        }

        try {
            await client.models.member.updateOne({_id: oldMember.user.id}, { roles: newMemberRoles }, {upsert: true}, (err, docs) => {
                // if(docs) console.log(docs);
                if(err) console.log(err);
            })
        } catch (error) {
            this.embed.errors.catch(error, client);
        }
        


        // edit the roles
        try{
            await member.removeRoles(prs);
        } catch(e) {
            this.embed.errors.catch(e, client);
        }
        try{
            await member.removeRole(previousDimensionID[0]);
        } catch(e) {
            this.embed.errors.catch(e, client);
        }


        var newPossibleDimensionRoles = client.cache.dimensions.get(dimensionID).roles;
        var rolesToAdd = memberData.roles.filter((r) => newPossibleDimensionRoles.includes(r));
        
        try{
            await member.addRoles(rolesToAdd);
        } catch(e) {
            this.embed.errors.catch(e, client);
        }
        

        // remove them from the list
        try { 
            await member.removeRole(botSettings.teleporting.role);
            client.indicators.teleporting = client.indicators.teleporting.filter(usr => usr != oldMember.user.id);
        } catch (error) {
            console.log(error);
            this.embed.errors.catch(error, client);
        }

    },
    requestPassword: async (client, user, dimensionID) => {
        const dimension = client.cache.dimensions.get(dimensionID);
        // KEEP AN EYE ON !dimension. I PUT IT THERE SO ALL THE OTHER RRs DONT RUN INTO AN ERROR IF THEY ARENT DIMENSIONS
        if(!dimension) {return true}
        if(!dimension.password) {return true}

        // dm the member a prompt to enter the password
        try {
            var dmChannel = await user.createDM();
        } catch (e) {
            // make this better
            console.log(e);
        }
        var passwordRequestEmbed = await this.embed.dimension.passwordRequest(dimensionID, client)
        await dmChannel.send(passwordRequestEmbed);

        var msgs = await dmChannel.awaitMessages(m => m.content, {max: 1, time: 30000});
        var enteredPassword = msgs.first().content;

        if(enteredPassword == dimension.password) {
            await dmChannel.send("That's the right password! GG");
            return true;
        } else {
            await dmChannel.send("Wrong password. Ending password wizard...");
            return false;
        }

    },
    // idek where i use this tbh
    scanMembers: async (client, msg) => {
        var members = await msg.guild.members;
        var membersData = [];
        for (var i = 0; i < members.length; i++) {
            var data = {};
            data["_id"] = members[i].user.id;
            data.roles = members[i].roles.keyArray();
            membersData.push(data);
        }
        await client.models.member.create(membersData, (err, members) => {
            if(err) console.log(err);

        });
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
    botSettings,
}