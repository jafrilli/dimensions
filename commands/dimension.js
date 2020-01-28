const { MessageEmbed } = require("discord.js");
const functions = require("../functions.js");
const df = require("../classes/dimensionFuncs.js");
const botSettings = require("../botSettings.json");
const wizard = require("../wizard.js");


const quitMessage = "You quit the dimensions™ setup wizard."


module.exports.run = async (msg, client, args) => {

    if(msg.channel.type == 'dm') return;

    if(client.indicators.usingCommand.includes(msg.author.id)) {
        await msg.channel.send("You are already using a command (setup wizard, etc.). Finish that command before starting another one. B-BAKA!!!");
        return;
    }

    if(!msg.member.hasPermission('ADMINISTRATOR')) {
        return msg.channel.send("You must be an Overlord™ to access dimension settings.");
    }

    client.indicators.usingCommand.push(msg.author.id);
    function removedID() {
        client.indicators.usingCommand = client.indicators.usingCommand.filter(user => user != msg.author.id)
    }

    switch (args[0]) {
        case "create":
            await dimensionCreate(msg, client, args);
            removedID();
            break;
        case "delete":
            await dimensionDelete(msg, client, args);
            removedID();
            break;
        case "list": 
            await dimensionList(msg, client, args);
            removedID();
            break;
        case "update":
            await dimensionUpdate(msg, client, args);
            removedID();
            break;
        case 'details':
            await dimensionDetails(msg, client, args);
            removedID()
            break;
        case 'help':
            await dimensionHelp(msg, client, args);
            removedID()
            break;
        case 'clearCache':
            await viewCache(msg, client, args);
            removedID()
            break;
        case 'addRoles': 
            await addRoles(msg, client, args);
            removedID();
            break;
        case 'deleteRoles': 
            await deleteRoles(msg, client, args);
            removedID();
            break;
        default:
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "dimension"
}

async function addRoles(msg, client, args) {
    var wizardResponse = await addRolesWizard(msg, client, args);
    if(!wizardResponse) {return msg.channel.send(quitMessage);};
    if(wizardResponse === false) {return msg.channel.send(quitMessage)}

    
    var successEmbed = new MessageEmbed({
        title: "__**Successfully Added Dimension™ Roles!**__",
        description: `The roles you have specified have been successfully added to the <@&${wizardResponse.dimensionID}>. Here are the roles you added: `
    })
    wizardResponse.addedRoles.forEach(role => {
        successEmbed.addField(`ID: ${role}`, `<@&${role}>`)
    })

    // upload them to the database using the db functions
    // await functions.db.update.one(
    //     client, 
    //     client.models.dimension,
    //     {_id: wizardResponse.dimensionID},
    //     {$addToSet: {roles: {$each: wizardResponse.addedRoles}}},
    //     (err) => {console.log("There was an error trying to add the new roles from addRoles into the database!")},
    //     (doc) => {console.log("Added the collected roles to the database!"); msg.channel.send(successEmbed)}
    // )
    await df.dimensionUpdate(
        client,
        wizardResponse.dimensionID,
        "roles",
        wizardResponse.addedRoles,
        (err) => {console.log("There was an error trying to add the new roles from addRoles into the database!")},
        (doc) => {console.log("Added the collected roles to the database!"); msg.channel.send(successEmbed)},
        true,
        false
    );

}

async function addRolesWizard(msg, client, args) {
    

    // maybe add if role is already in another dimension dont add? but i dont think that would cause problems anyway
    var collectedRoles = [];
    var dimensionRoles = client.cache.dimensions.keyArray();
    

    var selectedDimensionID = await wizard.type.dimension(
        msg,
        client,
        {
            title: "__**Dimension™ Role Addition Wizard**__",
            description: "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to add roles to, or type \'quit\' to stop this process:",
        },
        {
            title: "__**Dimension™ Role Addition Wizard**__",
            description: "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:",
        },
    );
    if(selectedDimensionID === false) {return false}

    do {
        var mentionedRole = await wizard.default(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Add Dimension™ Roles**__",
                description: `**Mention** __one__ role you would like to add to the <@&${selectedDimensionID}> dimension™.`,
                footer: {
                    text: "Type \'done\' when you're done adding roles, or type \'quit\' to quit wizard entirely..."
                }
            },
            (item) => {
                return item;
            },
            {
                title: "__**Add Dimension™ Roles**__",
                description: `Your response needs to be a role mention (It cannot be a dimension role like <@&${selectedDimensionID}>).`,
                footer: {
                    text: "Type \'done\' when you're done adding roles, or type \'quit\' to quit wizard entirely...",
                }
            },
        );
        if(mentionedRole === false) {return false}

        if(mentionedRole.mentions.roles.array().length > 0) {
            var roleID = mentionedRole.mentions.roles.first().id
            if(!dimensionRoles.includes(roleID)) {
                additionAttempted = false;
                collectedRoles.push(roleID);
                await msg.channel.send(`Added the <@&${roleID}> role to the list of roles that need to be added. Type \'done\' if you added everything.`);
            }
        }
    
    } while (mentionedRole.content.toLowerCase() != "done")

    var additionResponse = {
        dimensionID: selectedDimensionID,
        addedRoles: collectedRoles
    };
    
    return additionResponse;
}

async function deleteRoles(msg, client, args) {
    var wizardResponse = await deleteRolesWizard(msg, client, args);
    if(!wizardResponse) {return msg.channel.send(quitMessage);}
    if(wizardResponse === false) {return msg.channel.send(quitMessage)}

    var successEmbed = new MessageEmbed({
        title: "__**Successfully Deleted Dimension™ Roles!**__",
        description: `The roles you have specified have been successfully deleted from the <@&${wizardResponse.dimensionID}> dimension list. Here are the roles you deleted: `
    })
    
    wizardResponse.deletedRoles.forEach(role => {
        successEmbed.addField(`ID: ${role}`, `<@&${role}>`)
    })

    // // upload them to the database using the db functions
    // await functions.db.update.one(
    //     client, 
    //     client.models.dimension,
    //     {_id: wizardResponse.dimensionID},
    //     {$pull: {roles: {$in: wizardResponse.deletedRoles}}},
    //     (err) => {console.log("There was an error trying to remove roles from deleteRoles from the database!")},
    //     (doc) => {console.log("Deleted the collected roles from the database!"); msg.channel.send(successEmbed)}
    // )
    await df.dimensionUpdate(
        client,
        wizardResponse.dimensionID,
        "roles",
        wizardResponse.deletedRoles,
        (err) => {console.log("There was an error trying to remove roles from deleteRoles from the database!")},
        (doc) => {msg.channel.send(successEmbed)},
        false,
        true
    );
}

async function deleteRolesWizard(msg, client, args) {
    
    // maybe add if role is already in another dimension dont add? but i dont think that would cause problems anyway
    var collectedRoles = [];    
    
    var selectedDimensionID = await wizard.type.dimension(
        msg,
        client,
        {
            title: "__**Dimension™ Role Deletion Wizard**__",
            description: "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to remove roles from, or type \'quit\' to stop this process:",
        },
        {
            title: "__**Dimension™ Role Deletion Wizard**__",
            description: "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:",
        },
    );
    if(selectedDimensionID === false) {console.log("returnnn"); return false}

    do {
        var selectedRole = await wizard.type.dimensionRole(
            msg,
            client,
            selectedDimensionID,
            {
                title: "__**Delete Dimension™ Roles!**__",
                description: `Type in the **number** of __one__ role you would like to delete from the <@&${selectedDimensionID}> dimension™.`,
            },
            {
                title: "__**Delete Dimension™ Roles!**__",
                description: `Your response needs to be the **number** next to the name of the role.`,
            },
        );
        if(selectedRole === false) {return false}
        
        if(selectedRole.content) {
            if(selectedRole.content.toLowerCase() == "done") break;
        }

        if(!collectedRoles.includes(selectedRole)) {
            collectedRoles.push(selectedRole);
            await msg.channel.send(`Added the <@&${selectedRole}> role to the list of roles that need to be deleted. Type \'done\' if you added everything.`);
        }
        else {
            await msg.channel.send(`You already added the <@&${selectedRole}> role to the list of roles that need to be deleted! Add something else, or type \'done\' if you added everything.`);
        }

    } while (true)

    var deletionResponse = {
        dimensionID: selectedDimensionID,
        deletedRoles: collectedRoles
    };
    
    return deletionResponse;
}

async function viewCache(msg, client, args) {
    console.log(client.cache.dimensions)
}

// >CREATE< (D O N E)
async function dimensionCreate(msg, client, args) {
    
    var newDimension = await createDimensionSequence(msg, client, args);
    if(!newDimension) {
        msg.channel.send("Exited the dimension™ setup wizard!")
        return;
    };
    if(newDimension === false) return msg.channel.send(quitMessage);

    // Create new dimension™ role:
    try{
        var newOfficerRole = await msg.guild.roles.create({
            data: {
                name: `${newDimension.name} Corp. Officer`,
                color: newDimension.color,
                mentionable: true
            }
        });
        var newRole = await msg.guild.roles.create({
            data: {
                name: `『${newDimension.name}』`,
                color: newDimension.color,
                mentionable: false
            }
        })
    } catch (err) {
        msg.channel.send("There was a problem making the role (roles.create()) in the \'>dimension create\' process. Please contact the developer.").catch(
            console.log("ERROR TRYING TO SEND THE ERROR MESSAGE WHILE creating new role for new dimension: \n" + err)
        );
        return;
    }
    
    newDimension["_id"] = newRole.id;
    newDimension.roles = [newOfficerRole.id];
    newDimension.dateCreated = new Date();
    newDimension.password = null;
    newDimension.officerRole = newOfficerRole.id;

    // Rich embed (finalizing)
    const dimensionEmbed = new MessageEmbed({
        title: "__**New Dimension™ Details:**__",
        description: "Successfully created a new dimension™ role and database entry.",
        thumbnail: {url: newDimension.emoji.url},
        image: {url: newDimension.graphic},
        color: newDimension.color,
        fields: [
            {name: "**Title**", value: newDimension.name},
            {name: "**Description**", value: newDimension.description},
            {name: "**Role**", value: `<@&${newRole.id}>`},
            {name: "**Color #**", value: newDimension.color},
            {name: "**Emoji ID**", value: newDimension.emoji.id},
            {name: "**Officer Role**", value: `<@&${newOfficerRole.id}>`},
            {name: "**Roles**", value: "Add to this list using \'>dimension addRole <dimensionRole> <desiredRoleToAdd>\'*"}
        ],
    })
    await msg.channel.send(dimensionEmbed);

    await df.dimensionCreate(
        client,
        newDimension,
        (err) => {console.log("ERROR WHEN SAVING DIMENSION USING DIMENSION CREATE: \n" + err);},
        (docs) => {msg.channel.send(`Successfully created the <@&${newDimension["_id"]}> dimension!`)}
    );
    
    const officerPerms = ['MANAGE_PERMISSIONS', 'MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER'];
    const memberPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES']
    //? RECENTLY ADDED: Automatically makes three new categories and 
    try {
        msg.guild.channels.create(newDimension.name+" one", {
            type: 'category',
            permissionOverwrites: [
                {
                    id: newRole,
                    allow: memberPerms
                },
                {
                    id: newOfficerRole,
                    allow: officerPerms
                },
                {
                    id: botSettings.guild,
                    deny: memberPerms
                }
            ]
        });
        msg.guild.channels.create(newDimension.name+" two", {
            type: 'category',
            permissionOverwrites: [
                {
                    id: newRole,
                    allow: memberPerms
                },
                {
                    id: newOfficerRole,
                    allow: officerPerms
                },
                {
                    id: botSettings.guild,
                    deny: memberPerms
                }
            ]
        });
        msg.guild.channels.create(newDimension.name+" three", {
            type: 'category',
            permissionOverwrites: [
                {
                    id: newRole,
                    allow: memberPerms
                },
                {
                    id: newOfficerRole,
                    allow: officerPerms
                },
                {
                    id: botSettings.guild,
                    deny: memberPerms
                }
            ]
        });
    } catch(err) {
        functions.embed.errors.catch(err, client);
    }
    msg.channel.send(`Successfully created a category for the <@&${newDimension["_id"]}> dimension! Now you just gotta add more channels`);
}

// >FIND< {} (D O N E)
// detailedDetails 
async function dimensionUpdate(msg, client, args) {
    
    // select a dimension
    var selectedDimensionID = await wizard.type.dimension(
        msg,
        client,
        {
            title: "__**Dimension™ Update Wizard**__",
            description: "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to update, or type \'quit\' to stop this process:",
        },
        {
            title: "__**Dimension™ Update Wizard**__",
            description: "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:",
        },
    );
    if(selectedDimensionID === false) {return msg.channel.send(quitMessage)}

    await functions.embed.dimension.detailedDetails(selectedDimensionID, msg, client);
    const updateOptions = [
        "name",
        "description",
        "color",
        "emoji",
        "graphic",
        "password",
        "officer"
    ]
    var whatToUpdateAttempted = false;
    do {
        var whatToUpdateDescription = `Here's a list of things you can update on the <@&${selectedDimensionID}> dimension™. Type what you want to update (not case-sensitive dw :3), or type \'quit\' to stop this process:`;
        if(whatToUpdateAttempted) {
            whatToUpdateDescription = "Your answer has to be one of the following settings! Try again, or type \'quit\' to stop this process:"
        }
        await msg.channel.send(new MessageEmbed({
            description: whatToUpdateDescription,
            fields: [
                // MAKE SURE TO UPDATE updateOptions[] ABOVE IF U UPDATE THIS ARRAY
                {name: "Name", value: "Name of the dimension™", inline: true},
                {name: "Description", value: "Description of the dimension™", inline: true},
                {name: "Color", value: "Color of the dimension™ (including role)", inline: true},
                {name: "Emoji", value: "Emoji of the dimension™", inline: true},
                {name: "Graphic", value: "Graphic of the dimension™ (not an option during creation)", inline: true},
                {name: "Password", value: "Password of the dimension™ (not an option during creation)", inline: true},
                {name: "Officer", value: "Officer role of the dimension™ (not an option during creation)", inline: true}
            ]
        }))
        try {
            var whatToUpdate = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1, time: 15000, errors: ['time']})
        } catch(err) {
            msg.channel.send('⏰ You ran out of time (+' + 15 + ' seconds)! Ending wizard...');
            return;
        }
        if(whatToUpdate.first().content === "quit") { msg.channel.send("You quit the dimensions™ update wizard."); return }
        whatToUpdateAttempted = true;
    } while (!updateOptions.includes(whatToUpdate.first().content.toLowerCase()))
    var whatToUpdateResponse = whatToUpdate.first().content.toLowerCase();

    switch (whatToUpdateResponse) {
        case "name":
            await updateFunctions.updateName(selectedDimensionID, msg, client);
            // console.log("name")
            break;
        case "description":
            await updateFunctions.updateDescription(selectedDimensionID, msg, client);
            // console.log("description")
            break;
        case "color":
            await updateFunctions.updateColor(selectedDimensionID, msg, client);
            // console.log("color")
            break;
        case "emoji":
            await updateFunctions.updateEmoji(selectedDimensionID, msg, client);
            // console.log("emoji")
            break;
        case "graphic": 
            await updateFunctions.updateGraphic(selectedDimensionID, msg, client);
            // console.log("graphic")
            break;
        case "password": 
            await updateFunctions.updatePassword(selectedDimensionID, msg, client);
            // console.log("password")
            break;
        case "officer": 
            await updateFunctions.updateOfficer(selectedDimensionID, msg, client);
            // console.log("officer")
            break;
        default: 
            console.log("super weird error. you should literally never get this. like ever")
            break;
    }
}

// FIND BY ID AND >DELETE< (D O N E)
async function dimensionDelete(msg, client, args) {

    // 3. ask/send embed, and wait for appropriate answer
    var selectedDimensionID = await wizard.type.dimension(
        msg,
        client,
        {
            title: "__**Dimension™ Delete Wizard**__",
            description: "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to delete, or type \'quit\' to stop this process:",
        },
        {
            title: "__**Dimension™ Delete Wizard**__",
            description: "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:",
        },
    );
    if(selectedDimensionID === false) {return msg.channel.send(quitMessage)}

    var confirmation = await wizard.type.confirmation(
        msg,
        client,
        `Are you sure you want to delete the <@&${selectedDimensionID}> dimension? Type \'confirm\' to confirm this action. Otherwise, type \'quit\' to quit this process.`,
        "Incorrect response! Type \'confirm\' to confirm the deletion of the dimension™ selected. Otherwise, type \'quit\' to quit this process.",
        null
    );
    if(confirmation === false) {return msg.channel.send("You quit the dimensions™ delete wizard.")};

    var startTime = new Date();

    await df.dimensionDelete(
        client, 
        selectedDimensionID, 
        (err) => {console.log("ERROR DELETING DIMENSION BY ID (MONGOOSE/MONGODB ERROR): \m" + err);},
        (doc) => {msg.channel.send(`Successfully deleted the dimension™ from the database, along with its roles!`);}
    )
    var endTime = new Date();
    var time = endTime - startTime;
    await msg.channel.send("Took " + time.toString() + " milliseconds to process!");
    
    // 6. delete the role from the guild
    try {
        await msg.guild.roles.get(selectedDimensionID).delete();
    } catch (err) {
        functions.embed.errors.catch(err, client);
    }
}

// >FIND< {} (D O N E)
async function dimensionList(msg, client, args) {
    
    const embed = new MessageEmbed();
    embed.setTitle("__**Dimension™ List**__");
    embed.setDescription("Here's a list of all the existing dimensions. Type \'>dimension create\' to create a dimension, and type \'>dimension delete\' to delete one.")

    await client.cache.dimensions.forEach(dimension => {
        embed.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    await msg.channel.send(embed);

}

// >FIND< {} (D O N E)
// detailedDetails
async function dimensionDetails(msg, client, args) {

    var selectedDimensionID = await wizard.type.dimension(
        msg,
        client,
        {
            title: "__**Dimension™ Details Wizard**__",
            description: "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to view in detail, or type \'quit\' to stop this process:",
        },
        {
            title: "__**Dimension™ Details Wizard**__",
            description: "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:",
        },
    );
    if(selectedDimensionID === false) {return msg.channel.send(quitMessage)}


    await functions.embed.dimension.detailedDetails(selectedDimensionID, msg, client);
    await msg.channel.send("Here are the server's details <3");

}

// temporary, until we make a bigger, global (not just >dimension) help wizard ig
// NO DB FUNCTIONS
async function dimensionHelp(msg, client, args) {
    const embed = new MessageEmbed({
        title: "__**Dimension™ Help**__",
        description: "All of these commands __do not__ need arguments (text after them). They are all setup wizards. Type \'quit\' at anytime during the setup wizard to cancel the process (EXCEPT IN THE EMOJI/REACT PHASE. STILL WORKING ON THAT).",
        fields: [
            {name: ">dimension create", value: "Takes you through a setup wizard that helps you make a dimension"},
            {name: ">dimension update", value: "Takes you through a setup wizard that helps you update a dimension"},
            {name: ">dimension delete", value: "Takes you through a setup wizard that helps you delete a dimension"},
            {name: ">dimension details", value: "Takes you through a setup wizard that helps you get details on a dimension"},
            {name: ">dimension list", value: "Lists all available dimensions"},
            {name: ">dimension help", value: "Lists all available commands (this)"},
            {name: ">dimension addRoles", value: "Takes you through a setup wizard that helps you add roles to a dimension"},
            {name: ">dimension deleteRoles", value: "Takes you through a setup wizard that helps you remove roles from a dimension"},
        ]
    });

    await msg.channel.send(embed);
    await msg.channel.send("Done :3")
}

// NO DB FUNCTIONS
async function createDimensionSequence(msg, client, args) {

    var newDimension = {}

    // Set Title:
    newDimension.name = await wizard.type.text(
        msg, 
        client,
        false,
        null,
        {
            title: "__**New Dimension™: Name**__",
            description: "Enter the \'name\' of the new dimension you wish to create:",
        },
    );
    if(newDimension.name === false) {return false;}


    // Set Description: 
    newDimension.description = await wizard.type.text(
        msg, 
        client,
        false,
        null,
        {
            title: "__**New Dimension™: Description**__",
            description: "Enter the \'description\' of the new dimension you wish to create:",
        },
    );
    if(newDimension.description === false) {return false;}


    // Set Color: 
    let newDimensionColor = await wizard.type.color(
        msg,
        client,
        false,
        null,
        {
            title: "__**New Dimension™: Color**__",
            description: "Enter the hex \'color\' of the new dimension IN THIS FORMAT: \'#000000\'. This will also be the color of your dimension role.",
        },
        {
            title: "__**New Dimension™: Color**__",
            description: "Needs to be a valid hex color. You need to add the hashtag (#), plus 6 digits. Try again.",
        },
    );
    if(newDimensionColor === false) {return false};
    newDimension.color = parseInt(functions.toolkit.converter.hexToDec(newDimensionColor.replace("#", "0x")));
    


    // Set Emoji:
    // ! Add color to embed, or switch color and emoji
    newDimension.emoji = await wizard.type.reaction(
        msg,
        client,
        {
            title: "__**New Dimension™: Emoji**__",
            description: "React to this message with an \'emote\' **FROM THIS SERVER** you want to use for the new dimension™:"
        },
        {
            title: "__**New Dimension™: Emoji**__",
            description: "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try again."
        },
    );
    if(newDimension.emoji === false) {return false}
    
    newDimension.graphic = null;
    
    return newDimension;
}

// >UPDATE< ONE (ALL OF THEM) (D O N E)
// detailedDetails (ALL OF THEM)
var updateFunctions = {
    updateName: async (dimensionID, msg, client) => {
        
        let updatedName = await wizard.type.text(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Name**__",
                description: `Enter the new \'name\' of the <@&${dimensionID}> dimension™:`,
            },
        );
        if(updatedName === false) {return msg.channel.send(quitMessage);}

        // Dimension.updateOne({_id: dimensionID}, {name: updatedName}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - NAME (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the name on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.guild.roles.get(dimensionID).edit({name: `『${updatedName}』`})
        //         await msg.channel.send("Successfully updated the name <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {name: updatedName},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - NAME (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the name on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.guild.roles.get(dimensionID).edit({name: `『${updatedName}』`})
        //         await msg.channel.send("Successfully updated the name <3")
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // )
        await df.dimensionUpdate(
            client,
            dimensionID,
            "name",
            updatedName,
            (err) => {
                console.log("ERROR UPDATING DIMENSION - NAME (DB VERSION): \n" + err)
                msg.channel.send("There was an issue updating the name on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.guild.roles.get(dimensionID).edit({name: `『${updatedName}』`})
                await msg.channel.send("Successfully updated the name <3")
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )

    },
    updateDescription: async (dimensionID, msg, client) => {
        
        let updatedDescription = await wizard.type.text(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Description**__",
                description: `Enter the new \'description\' of the <@&${dimensionID}> dimension™:`,
            },
        );
        if(updatedDescription === false) {return msg.channel.send(quitMessage);}
    
        // Dimension.updateOne({_id: dimensionID}, {description: updatedDescription}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - DESCRIPTION (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the description on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.channel.send("Successfully updated the description <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // await functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {description: updatedDescription},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - DESCRIPTION (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the description on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.channel.send("Successfully updated the description <3");
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // )
        await df.dimensionUpdate(
            client,
            dimensionID,
            "description",
            updatedDescription,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - DESCRIPTION (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the description on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.channel.send("Successfully updated the description <3");
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
    updateColor: async (dimensionID, msg, client) => {
        let updatedClr = await wizard.type.color(
            msg,
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Color**__",
                description: `Enter the new hex \'color\' of the <@&${dimensionID}> dimension™ USING THIS FORMAT: \'#000000\' . This will also be the color of your dimension role.`,
            },
            {
                title: "__**Update Dimension™: Color**__",
                description: "Needs to be a valid hex color. You need to add the hashtag (#), plus 6 digits. Try again.",
            },
        );
        if(updatedClr === false) {return msg.channel.send(quitMessage)};

        var updatedColor = parseInt(functions.toolkit.converter.hexToDec(updatedClr.replace("#", "0x")));
        
        // Dimension.updateOne({_id: dimensionID}, {color: updatedColor}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - COLOR (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the color on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.guild.roles.get(dimensionID).edit({color: updatedColor});
        //         await msg.channel.send("Successfully updated the color <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // await functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {color: updatedColor},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - COLOR (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the color on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.guild.roles.get(dimensionID).edit({color: updatedColor});
        //         await msg.channel.send("Successfully updated the color <3");
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // );
        await df.dimensionUpdate(
            client,
            dimensionID,
            "color",
            updatedColor,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - COLOR (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the color on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.guild.roles.get(dimensionID).edit({color: updatedColor});
                await msg.channel.send("Successfully updated the color <3");
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
    updateEmoji: async (dimensionID, msg, client) => {
        // var emojiAttempted = false
        // do {
        //     var emojiSetupMessage = `React to this message with a new \'emote\' **FROM THIS SERVER** you want to use for the updated <@&${dimensionID}> dimension™ emote:`;
        //     if(emojiAttempted) {emojiSetupMessage = "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try Again."}
        //     var emojiRequest = await msg.channel.send(new MessageEmbed({title: `__**Update <@&${dimensionID}> Dimension™: Emoji**__`, description: emojiSetupMessage, footer: {text: "You can't type \'quit\' in this part of the setup. Choose something random if you're unsure. You can update it later..."}}))
        //     try{
        //         var dimensionEmoji = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1});
        //     }catch(err){
        //         console.log("ERROR UPDATING DIMENSION - EMOJI: \n" + err)

        //     }
        //     emojiAttempted = true
        // } while (!dimensionEmoji.first().emoji.id && !dimensionEmoji.first().emoji.url)
        // var updatedEmoji = {
        //     id: dimensionEmoji.first().emoji.id,
        //     url: dimensionEmoji.first().emoji.url,
        //     name: dimensionEmoji.first().emoji.name
        // }
        let updatedEmoji = await wizard.type.reaction(
            msg,
            client,
            {
                title: `__**Update <@&${dimensionID}> Dimension™: Emoji**__`,
                description: `React to this message with a new \'emote\' **FROM THIS SERVER** you want to use for the updated <@&${dimensionID}> dimension™ emote:`
            },
            {
                title: `__**Update <@&${dimensionID}> Dimension™: Emoji**__`,
                description: "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try again."
            },
        );
        if(updatedEmoji === false) {return msg.channel.send(quitMessage)}

        // Dimension.updateOne({_id: dimensionID}, {emoji: updatedEmoji}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - EMOJI (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the emoji on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.channel.send("Successfully updated the emote <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // await functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {emoji: updatedEmoji},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - EMOJI (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the emoji on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.channel.send("Successfully updated the emote <3");
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // );
        await df.dimensionUpdate(
            client,
            dimensionID,
            "emoji",
            updatedEmoji,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - EMOJI (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the emoji on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.channel.send("Successfully updated the emote <3");
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
    updateGraphic: async (dimensionID, msg, client) => {
        
        let updatedGraphic = await wizard.type.graphic(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Graphic**__",
                description: `Enter the new \'graphic\' **url** for the <@&${dimensionID}> dimension™. The url must end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__:`,
            },
            {
                title: "__**Update Dimension™: Graphic**__",
                description: "Invaild input! The __url__ **must** end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. You can exit the update wizard by typing \'quit\' anytime you want.",
            },
        );
        if(updatedGraphic === false) {return msg.channel.send(quitMessage);}

        // Dimension.updateOne({_id: dimensionID}, {graphic: updatedGraphic}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - GRAPHIC (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the graphic on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.channel.send("Successfully updated the graphic <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // await functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {graphic: updatedGraphic},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - GRAPHIC (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the graphic on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.channel.send("Successfully updated the graphic <3");
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // );
        await df.dimensionUpdate(
            client,
            dimensionID,
            "graphic",
            updatedGraphic,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - GRAPHIC (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the graphic on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.channel.send("Successfully updated the graphic <3");
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
    updatePassword: async (dimensionID, msg, client) => {
        
        let updatedPassword = await wizard.type.text(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Password**__",
                description: `Enter the new \'password\' of the <@&${dimensionID}> dimension™:`,
            },
        );
        if(updatedPassword === false) {return msg.channel.send(quitMessage);}

        // Dimension.updateOne({_id: dimensionID}, {name: updatedName}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - NAME (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the name on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.guild.roles.get(dimensionID).edit({name: `『${updatedName}』`})
        //         await msg.channel.send("Successfully updated the name <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {password: updatedPassword},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - PASSWORD (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the password on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.channel.send("Successfully updated the password <3")
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // )
        await df.dimensionUpdate(
            client,
            dimensionID,
            "password",
            updatedPassword,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - PASSWORD (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the password on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.channel.send("Successfully updated the password <3")
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
    updateOfficer: async (dimensionID, msg, client) => {

        let updatedOfficerRole = await wizard.type.mention.role(
            msg, 
            client,
            false,
            null,
            {
                title: "__**Update Dimension™: Officer Role**__",
                description: `Mention the new \'officer role\' for the <@&${dimensionID}> dimension™.`,
            },
            {
                title: "__**Update Dimension™: Officer Role**__",
                description: `Invaild input! You must mention the role that you want to set as <@&${dimensionID}>'s officer role.`
            }
        );
        if(updatedOfficerRole === false) {return msg.channel.send(quitMessage);}
        let updatedOfficer = updatedOfficerRole.id;


        // Dimension.updateOne({_id: dimensionID}, {name: updatedName}, async (err, rawResponse) => {
        //     if(err) {
        //         console.log("ERROR UPDATING DIMENSION - NAME (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the name on the database ;-;. Contact the developer...");
        //         return;
        //     }
        //     if(rawResponse) {
        //         // success
        //         await msg.guild.roles.get(dimensionID).edit({name: `『${updatedName}』`})
        //         await msg.channel.send("Successfully updated the name <3");
        //         await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // })
        // functions.db.update.one(
        //     client,
        //     client.models.dimension, 
        //     {_id: dimensionID}, 
        //     {password: updatedPassword},
        //     async (err) => {
        //         console.log("ERROR UPDATING DIMENSION - PASSWORD (DB VERSION): \n" + err)
        //         await msg.channel.send("There was an issue updating the password on the database ;-;. Contact the developer...");
        //     },
        //     async (doc) => {
        //         await msg.channel.send("Successfully updated the password <3")
        //         // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
        //     }
        // )
        await df.dimensionUpdate(
            client,
            dimensionID,
            "officerRole",
            updatedOfficer,
            async (err) => {
                console.log("ERROR UPDATING DIMENSION - OFFICER ROLE (DB VERSION): \n" + err)
                await msg.channel.send("There was an issue updating the officer role on the database ;-;. Contact the developer...");
            },
            async (doc) => {
                await msg.channel.send("Successfully updated the officer role <3")
                // await functions.embed.dimension.detailedDetails(dimensionID, msg, client);
            }
        )
    },
}

module.exports.updateFunctions = updateFunctions;