const { RichEmbed, Role, Collection } = require("discord.js");
const functions = require("../functions.js");
const df = require("../classes/dimensionFuncs.js");
const botSettings = require("../botSettings.json");

// enum equivalent of javascript


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
    if(!wizardResponse) return;
    
    var successEmbed = new RichEmbed({
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
    var allDimensions = {};
    const embedOne = new RichEmbed();
    
    await client.cache.dimensions.forEach(dimension => {
        allDimensions[dimension.name] = dimension["_id"];
        embedOne.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    embedOne.setTitle("__**Dimension™ Role Addition Wizard**__");
    
    var selectionAttempted = false;
    do {
        // description
        var dimensionRoleAddMessage = "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to add roles to, or type \'quit\' to stop this process:";
        if(selectionAttempted) {
            dimensionRoleAddMessage = "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
        }
        embedOne.setDescription(dimensionRoleAddMessage);

        await msg.channel.send(embedOne);
        try {
            var dimensionToUpdate = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING DIMENSION ROLE TO ADD ROLES TO IN DIMENSION ADDROLE: \n" + err)
        }
        if(dimensionToUpdate.first().content === "quit") { msg.channel.send("You quit the dimensions™ role addition wizard."); return }
        
        selectionAttempted = true;
    } while (!Object.keys(allDimensions).includes(dimensionToUpdate.first().content))
    var selectedDimensionID = allDimensions[dimensionToUpdate.first().content];


    var additionAttempted = false;
    do {
        var addRoleMessage = `**Mention** __one__ role you would like to add to the <@&${selectedDimensionID}> dimension™.`;
        if(additionAttempted) {addRoleMessage = `Your response needs to be a role mention (It cannot be a dimension role like <@&${selectedDimensionID}>).`}
        await msg.channel.send(new RichEmbed({title: "__**Add Dimension™ Roles**__", description: addRoleMessage, footer: {text: "Type \'done\' when you're done adding roles, or type \'quit\' to quit wizard entirely..."}}))
        

        try {
            var roleToAdd = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR ADDING DIMENSION ROLES: \n" + err)
        }
        
        
        if(roleToAdd.first().content === "quit") { message.channel.send("You quit the dimensions™ role setup wizard."); return }
        
        additionAttempted = true;
    
        if(roleToAdd.first().mentions.roles.array().length > 0) {
            var roleID = roleToAdd.first().mentions.roles.first().id
            if(!dimensionRoles.includes(roleID)) {
                additionAttempted = false;
                collectedRoles.push(roleID);
                await msg.channel.send(`Added the <@&${roleID}> role to the list of roles that need to be added. Type \'done\' if you added everything.`);
            }
        }
    
    } while (roleToAdd.first().content.toLowerCase() != "done")

    var additionResponse = {
        dimensionID: selectedDimensionID,
        addedRoles: collectedRoles
    };
    
    return additionResponse;
}

async function deleteRoles(msg, client, args) {
    var wizardResponse = await deleteRolesWizard(msg, client, args);
    if(!wizardResponse) return;

    var successEmbed = new RichEmbed({
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
        (doc) => {console.log("Deleted the collected roles from the database!"); msg.channel.send(successEmbed)},
        false,
        true
    );
}

async function deleteRolesWizard(msg, client, args) {
    

    // maybe add if role is already in another dimension dont add? but i dont think that would cause problems anyway
    var allDimensions = {};
    var allDimensionRoles = {};
    var collectedRoles = [];

    const embedOne = new RichEmbed();
    
    await client.cache.dimensions.forEach(dimension => {
        allDimensions[dimension.name] = dimension["_id"];
        embedOne.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    embedOne.setTitle("__**Dimension™ Role Deletion Wizard**__");
    
    var selectionAttempted = false;
    do {
        // description
        var dimensionRoleDeleteMessage = "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to delete roles from, or type \'quit\' to stop this process:";
        if(selectionAttempted) {
            dimensionRoleDeleteMessage = "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
        }
        embedOne.setDescription(dimensionRoleDeleteMessage);

        await msg.channel.send(embedOne);
        try {
            var dimensionToUpdate = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING DIMENSION ROLE TO DELETE ROLES TO IN DIMENSION DELETEROLE: \n" + err)
        }
        if(dimensionToUpdate.first().content === "quit") { msg.channel.send("You quit the dimensions™ role deletion wizard."); return }
        
        selectionAttempted = true;
    } while (!Object.keys(allDimensions).includes(dimensionToUpdate.first().content))
    var selectedDimensionID = allDimensions[dimensionToUpdate.first().content];



    var embedTwo = new RichEmbed({
        title: "__**Delete Dimension™ Roles!**__",
        description: `Type in the name of a role from the <@&${selectedDimensionID}> dimension™ you want to delete.`,
        footer: {text: "Type \'done\' when you're done deleting roles, or type \'quit\' to quit wizard entirely..."}
    })
    await client.cache.dimensions.get(selectedDimensionID).roles.forEach(role => {
        var roleName = client.guilds.get(functions.toolkit.botSettings.guild).roles.get(role).name
        allDimensionRoles[roleName] = role;
        embedTwo.addField(`**${roleName}**`, `<@&${role}>`)
    })
        

    var deletionAttempted = false;
    do {
        var deleteRoleMessage = `Type in the **name** of __one__ role you would like to delete from the <@&${selectedDimensionID}> dimension™.`;
        if(deletionAttempted) {deleteRoleMessage = `Your response needs to be the **exactly** the name of the role (The white text over the role mention).`}
        embedTwo.setDescription(deleteRoleMessage);
        await msg.channel.send(embedTwo)
        

        try {
            var roleToDelete = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR ADDING DIMENSION ROLES: \n" + err)
        }
        
        
        if(roleToDelete.first().content === "quit") { message.channel.send("You quit the dimensions™ role deletion wizard."); return }
        
        deletionAttempted = true;
    
            if(Object.keys(allDimensionRoles).includes(roleToDelete.first().content)) {
                var roleID = allDimensionRoles[roleToDelete.first().content];
                if(!collectedRoles.includes(roleID)) {
                    deletionAttempted = false;
                    collectedRoles.push(roleID);
                    await msg.channel.send(`Added the <@&${roleID}> role to the list of roles that need to be deleted. Type \'done\' if you added everything.`);
                }
                else {
                    deletionAttempted = false;
                    await msg.channel.send(`You already added the <@&${roleID}> role to the list of roles that need to be deleted! Add something else, or type \'done\' if you added everything.`);
                }
            }

    } while (roleToDelete.first().content.toLowerCase() != "done")

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
    
    var newDimension = await createDimensionSequence(msg);
    if(!newDimension) {
        msg.channel.send("Exited the dimension™ setup wizard!")
        return;
    };

    // Create new dimension™ role:
    try{
        var newRole = await msg.guild.createRole({
            name: `『${newDimension.name}』`,
            color: newDimension.color,
            mentionable: false
        })
    } catch (err) {
        msg.channel.send("There was a problem making the role (createRole()) in the \'>dimension create\' process. Please contact the developer.").catch(
            console.log("ERROR TRYING TO SEND THE ERROR MESSAGE WHILE creating new role for new dimension: \n" + err)
        );
        return;
    }
    
    newDimension["_id"] = newRole.id;
    newDimension.roles = [];
    newDimension.dateCreated = new Date();
    newDimension.password = null;

    // Rich embed (finalizing)
    const dimensionEmbed = new RichEmbed({
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
            {name: "**Roles**", value: "*Empty; Add to this list using \'>dimension addRole <dimensionRole> <desiredRoleToAdd>\'*"}
        ],
    })
    await msg.channel.send(dimensionEmbed);

    // Dimension.create(newDimension, (err, docs) => {
    //     if(err) {
    //         console.log("ERROR WHEN SAVING DIMENSION USING DIMENSION CREATE: \n" + err);
    //         return;
    //     }
    //     if(docs) {
    //         msg.channel.send(`Successfully created the \'${docs.name}\' dimension!`)
    //     }
    // });
    // await functions.db.add(
    //     client,
    //     client.models.dimension, 
    //     newDimension, 
    //     async (err) => {console.log("ERROR WHEN SAVING DIMENSION USING DIMENSION CREATE: \n" + err);},
    //     async (docs) => {msg.channel.send(`Successfully created the \'${docs.name}\' dimension!`)}
    // );
    await df.dimensionCreate(
        client,
        newDimension,
        (err) => {console.log("ERROR WHEN SAVING DIMENSION USING DIMENSION CREATE: \n" + err);},
        (docs) => {msg.channel.send(`Successfully created the <@&${newDimension["_id"]}> dimension!`)}
    );
    
    //? RECENTLY ADDED: Automatically makes a new category and starter channel
    msg.guild.createChannel(newDimension.name, {
        type: 'category',
        permissionOverwrites: [
            {
                id: newDimension["_id"],
                allow: ['READ_MESSAGES', 'SEND_MESSAGES']
            },
            {
                id: botSettings.guild,
                deny: ['READ_MESSAGES', 'SEND_MESSAGES']
            }
        ]
    });
    msg.channel.send(`Successfully created a category for the <@&${newDimension["_id"]}> dimension! Now you just gotta add more channels`);
}

// >FIND< {} (D O N E)
// detailedDetails 
async function dimensionUpdate(msg, client, args) {
    
    const embedOne = new RichEmbed()

    var allDimensions = {};
    // will be structured like this { "nameOfRole": "idOfRole", "nameOfRole": "idOfRole", etc... }
    // 1. connect to the db, get all dimensions
    // await Dimension.find({}, {name: 1}, (err, docs) => {
    //     if(err) {
    //         console.log("ERROR TRYING TO RETRIEVE DIMENSIONS FOR DIMENSIONUPDATE(): \n" + err);
    //         return;
    //     }
    //     if(docs) {
    //         docs.forEach((doc) => {
    //             allDimensions[doc.name] = doc["_id"];
    //             embedOne.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
    //         })

    //     }
    // })
    await client.cache.dimensions.forEach(dimension => {
        allDimensions[dimension.name] = dimension["_id"];
        embedOne.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    // 2. set variables for rich embed (mention role using <$&>) with fields
    embedOne.setTitle("__**Dimension™ Update Wizard**__");
    
    // 3. ask/send embed, and wait for appropriate answer
    var updateAttempted = false;
    do {
        // description
        var dimensionUpdateMessage = "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to update, or type \'quit\' to stop this process:";
        if(updateAttempted) {
            dimensionUpdateMessage = "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
        }
        embedOne.setDescription(dimensionUpdateMessage);

        await msg.channel.send(embedOne);
        try {
            var dimensionToUpdate = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING DIMENSION ROLE TO UPDATE IN DIMENSIONUPDATE: \n" + err)
        }
        if(dimensionToUpdate.first().content === "quit") { msg.channel.send("You quit the dimensions™ update wizard."); return }
        
        updateAttempted = true;
    } while (!Object.keys(allDimensions).includes(dimensionToUpdate.first().content))
    var selectedDimensionID = allDimensions[dimensionToUpdate.first().content];
    

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
        await msg.channel.send(new RichEmbed({
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
            var whatToUpdate = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING WHAT TO UPDATE IN DIMENSIONUPDATE: \n" + err)
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
    
    const embed = new RichEmbed()

    var allDimensions = {};
    // will be structured like this { "nameOfRole": "idOfRole", "nameOfRole": "idOfRole", etc... }
    // 1. connect to the db, get all dimensions
    // await Dimension.find({}, {name: 1}, (err, docs) => {
    //     if(err) {
    //         console.log("ERROR TRYING TO RETRIEVE DIMENSIONS FOR DIMENSIONDELETE(): \n" + err);
    //         return;
    //     }
    //     if(docs) {
    //         docs.forEach((doc) => {
    //             allDimensions[doc.name] = doc["_id"];
    //             embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
    //         })

    //     }
    // })
    await client.cache.dimensions.forEach(dimension => {
        allDimensions[dimension.name] = dimension["_id"];
        embed.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    // 2. set variables for rich embed (mention role using <$&>) with fields
    embed.setTitle("__**Dimension™ Delete Wizard**__");
    
    // 3. ask/send embed, and wait for appropriate answer
    var deleteAttempted = false;
    do {        // description
        var dimensionDeleteMessage = "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to delete, or type \'quit\' to stop this process:";
        if(deleteAttempted) {
            dimensionDeleteMessage = "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
        }
        embed.setDescription(dimensionDeleteMessage);

        await msg.channel.send(embed);
        try {
            var dimensionToDelete = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING DIMENSION ROLE TO DELETE IN DIMENSIONDELETE: \n" + err)
        }
        if(dimensionToDelete.first().content === "quit") { msg.channel.send("You quit the dimensions™ delete wizard."); return }
        
        deleteAttempted = true;
    } while (!Object.keys(allDimensions).includes(dimensionToDelete.first().content))
    var selectedDimensionID = allDimensions[dimensionToDelete.first().content];

    // 4. confirm action
    var confirmAttempted = false
    do {
        var confirmMessage = `Are you sure you want to delete the <@&${selectedDimensionID}> dimension? Type \'confirm\' to confirm this action. Otherwise, type \'quit\' to quit this process.`
        if(confirmAttempted) {confirmMessage = "Incorrect response! Type \'confirm\' to confirm the deletion of the dimension™ selected. Otherwise, type \'quit\' to quit this process."}
        await msg.channel.send(confirmMessage);
        try {
            var confirmation = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CONFIRMING THE DELETION OF DIMENSION: \n" + err)
        }
        if(confirmation.first().content === "quit") { msg.channel.send("You quit the dimensions™ delete wizard."); return }
        confirmAttempted = true;
    } while (confirmation.first().content.toLowerCase() != "confirm")

    // 5. delete dimension db entry using its id
    // Dimension.findByIdAndDelete(selectedDimensionID, (err, doc) => {
    //     if(err) {
    //         console.log("ERROR DELETING DIMENSION BY ID (MONGOOSE/MONGODB ERROR): \m" + err);
    //         return;
    //     }
    //     msg.channel.send(`Successfully deleted the ${doc.name} dimension™ from the database, along with its roles!`);
    // })
    var startTime = new Date();
    // await functions.db.delete.one(
    //     client,
    //     client.models.dimension, 
    //     {_id: selectedDimensionID}, 
    //     async (err) => {console.log("ERROR DELETING DIMENSION BY ID (MONGOOSE/MONGODB ERROR): \m" + err);},
    //     async (doc) => {msg.channel.send(`Successfully deleted the dimension™ from the database, along with its roles!`);}
    // )
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
    await msg.guild.roles.get(selectedDimensionID).delete();

}

// >FIND< {} (D O N E)
async function dimensionList(msg, client, args) {
    
    const embed = new RichEmbed();
    embed.setTitle("__**Dimension™ List**__");
    embed.setDescription("Here's a list of all the existing dimensions. Type \'>dimension create\' to create a dimension, and type \'>dimension delete\' to delete one.")

    // await Dimension.find({}, {name: 1}, (err, docs) => {
    //     if(err) {
    //         console.log("ERROR RETRIEVING DIMENSION DATA FOR DIMENSIONLIST FUNCTION: \n" + err)
    //         return;
    //     }
    //     if(docs) {
    //         docs.forEach(doc => {
    //             embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
    //         })
    //     }
    // })
    // console.log(client.cache.dimensions.array().length)
    await client.cache.dimensions.forEach(dimension => {
        embed.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    await msg.channel.send(embed);

}

// >FIND< {} (D O N E)
// detailedDetails
async function dimensionDetails(msg, client, args) {
    
    const embed = new RichEmbed()

    var allDimensions = {};
    // will be structured like this { "nameOfRole": "idOfRole", "nameOfRole": "idOfRole", etc... }
    // 1. connect to the db, get all dimensions
    // await Dimension.find({}, {name: 1}, (err, docs) => {
    //     if(err) {
    //         console.log("ERROR TRYING TO RETRIEVE DIMENSIONS FOR DIMENSIONDETAILS(): \n" + err);
    //         return;
    //     }
    //     if(docs) {
    //         docs.forEach((doc) => {
    //             allDimensions[doc.name] = doc["_id"];
    //             embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
    //         })

    //     }
    // })
    //console.log(client.cache.dimensions.array());
    await client.cache.dimensions.forEach(dimension => {
        allDimensions[dimension.name] = dimension["_id"];
        embed.addField(`**${dimension.name}**`, `<@&${dimension["_id"]}>`);
    })

    embed.setTitle("__**Dimension™ Details Wizard**__");

    var viewDetailsAttempt = false;
    do {        // description
        var dimensionDetailsMessage = "Type the __**exact name**__ (white text above the role) of the dimension from this list you want to view in detail, or type \'quit\' to stop this process:";
        if(viewDetailsAttempt) {
            dimensionDetailsMessage = "Incorrect response! Response must be the exact name of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
        }
        embed.setDescription(dimensionDetailsMessage);

        await msg.channel.send(embed);
        try {
            var dimensionToView = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR AWAITING DIMENSION ROLE TO DELETE IN DIMENSIONDELETE: \n" + err)
        }
        if(dimensionToView.first().content === "quit") { msg.channel.send("You quit the dimensions™ details wizard."); return }
        
        viewDetailsAttempt = true;
    } while (!Object.keys(allDimensions).includes(dimensionToView.first().content))
    var selectedDimensionID = allDimensions[dimensionToView.first().content];

    await functions.embed.dimension.detailedDetails(selectedDimensionID, msg, client);
    await msg.channel.send("Here are the server's details <3");

}
// temporary, until we make a bigger, global (not just >dimension) help wizard ig
// NO DB FUNCTIONS
async function dimensionHelp(msg, client, args) {
    const embed = new RichEmbed({
        title: "__**Dimension™ Help**__",
        description: "All of these commands __do not__ need arguments (text after them). They are all setup wizards. Type \'quit\' at anytime during the setup wizard to cancel the process (EXCEPT IN THE EMOJI/REACT PHASE. STILL WORKING ON THAT).",
        fields: [
            {name: ">dimension create", value: "Takes you through a setup wizard that helps you make a dimension"},
            {name: ">dimension update", value: "Takes you through a setup wizard that helps you update a dimension"},
            {name: ">dimension delete", value: "Takes you through a setup wizard that helps you delete a dimension"},
            {name: ">dimension details", value: "Takes you through a setup wizard that helps you get details on a dimension"},
            {name: ">dimension list", value: "Lists all available dimensions"},
            {name: ">dimension help", value: "Lists all available commands (this)"},

        ]
    });

    await msg.channel.send(embed);
    await msg.channel.send("Done :3")
}

// NO DB FUNCTIONS
async function createDimensionSequence(msg) {

    var newDimension = {}

    // Set Title:
    do {
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Name**__", description: "Enter the \'name\' of the new dimension you wish to create:", footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionTitle = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - TITLE: \n" + err)
        }
        if(dimensionTitle.first().content === "quit") {creationQuitted(msg); return }
        newDimension.name = dimensionTitle.first().content;
    } while (typeof newDimension.name != 'string')

    // Set Description: 
    do {
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Description**__", description: "Enter the \'description\' of the new dimension you wish to create:", footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionDescription = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - DESCRIPTION: \n" + err)
        }
        if(dimensionDescription.first().content === "quit") {creationQuitted(msg); return }
        newDimension.description = dimensionDescription.first().content;
    } while (typeof newDimension.description != 'string')

    // Set Color: 
    var colorAttempted = false;
    do {
        var colorSetupMessage = "Enter the hex \'color\' of the new dimension IN THIS FORMAT: \'#000000\'. This will also be the color of your dimension role.";
        if(colorAttempted) {colorSetupMessage = "You need to add the hashtag (#), plus 6 digits. Try Again."}
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Color**__", description: colorSetupMessage, footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionColor = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - COLOR: \n" + err)
        }
        if(dimensionColor.first().content === "quit") {creationQuitted(msg); return }
        colorAttempted = true;
    } while (!functions.toolkit.colorChecker.isHexColor(dimensionColor.first().content))
    var theDimensionColor = parseInt(functions.toolkit.converter.hexToDec(dimensionColor.first().content.replace("#", "0x")));
    newDimension.color = theDimensionColor;


    // Set Emoji:
    var emojiAttempted = false
    do {
        var emojiSetupMessage = "React to this message with an \'emote\' **FROM THIS SERVER** you want to use for the new dimension™:";
        if(emojiAttempted) {emojiSetupMessage = "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try Again."}
        var emojiRequest = await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Emoji**__", description: emojiSetupMessage, color: theDimensionColor, footer: {text: "You can't type \'quit\' in this part of the setup. Choose something random if you're unsure. You can update it later..."}}))
        try{
            var dimensionEmoji = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1});
        }catch(err){
            console.log("ERROR CREATING DIMENSION - EMOJI: \n" + err)

        }
        emojiAttempted = true
    } while (!dimensionEmoji.first().emoji.id && !dimensionEmoji.first().emoji.url)
    newDimension.emoji = {
        id: dimensionEmoji.first().emoji.id,
        url: dimensionEmoji.first().emoji.url,
        name: dimensionEmoji.first().emoji.name
    }
    
    newDimension.graphic = null;

    function creationQuitted(message) {
        message.channel.send("You quit the dimensions™ setup wizard.");
        return;
    }
    
    return newDimension;
}

// >UPDATE< ONE (ALL OF THEM) (D O N E)
// detailedDetails (ALL OF THEM)
var updateFunctions = {
    updateName: async (dimensionID, msg, client) => {

        await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Name**__`, description: `Enter the new \'name\' of the <@&${dimensionID}> dimension™:`, footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionName = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR UPDATING DIMENSION - NAME: \n" + err)
        }
        if(dimensionName.first().content === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
        var updatedName = dimensionName.first().content.toString();

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
        
        await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Description**__`, description: `Enter the new \'description\' of the <@&${dimensionID}> dimension™:`, footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionDescription = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR UPDATING DIMENSION - DESCRIPTION: \n" + err)
        }
        if(dimensionDescription.first().content === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
        var updatedDescription = dimensionDescription.first().content.toString();

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
        var colorAttempted = false;
        do {
            var colorSetupMessage = `Enter the new hex \'color\' of the <@&${dimensionID}> dimension™ USING THIS FORMAT: \'#000000\' . This will also be the color of your dimension role.`;
            if(colorAttempted) {colorSetupMessage = "Needs to be a valid hex color. You need to add the hashtag (#), plus 6 digits. Try Again."}
            await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Color**__`, description: colorSetupMessage, footer: {text: "Type \'quit\' to quit wizard..."}}))
            try {
                var dimensionColor = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
            } catch(err) {
                console.log("ERROR UPDATING DIMENSION - COLOR: \n" + err)
            }
            if(dimensionColor.first().content === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
            colorAttempted = true;
        } while (!functions.toolkit.colorChecker.isHexColor(dimensionColor.first().content))
        var updatedColor = parseInt(functions.toolkit.converter.hexToDec(dimensionColor.first().content.replace("#", "0x")));
        
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
    updateEmoji: async (dimensionID, msg, client) => {
        var emojiAttempted = false
        do {
            var emojiSetupMessage = `React to this message with a new \'emote\' **FROM THIS SERVER** you want to use for the updated <@&${dimensionID}> dimension™ emote:`;
            if(emojiAttempted) {emojiSetupMessage = "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try Again."}
            var emojiRequest = await msg.channel.send(new RichEmbed({title: `__**Update <@&${dimensionID}> Dimension™: Emoji**__`, description: emojiSetupMessage, footer: {text: "You can't type \'quit\' in this part of the setup. Choose something random if you're unsure. You can update it later..."}}))
            try{
                var dimensionEmoji = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1});
            }catch(err){
                console.log("ERROR UPDATING DIMENSION - EMOJI: \n" + err)

            }
            emojiAttempted = true
        } while (!dimensionEmoji.first().emoji.id && !dimensionEmoji.first().emoji.url)
        var updatedEmoji = {
            id: dimensionEmoji.first().emoji.id,
            url: dimensionEmoji.first().emoji.url,
            name: dimensionEmoji.first().emoji.name
        }

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
        var graphicAttempt = false;
        do {
            var graphicSetupMessage = `Enter the new \'graphic\' **url** for the <@&${dimensionID}> dimension™. The url must end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__:`;
            if(graphicAttempt) {graphicSetupMessage = "Invaild input! The __url__ **must** end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. You can exit the update wizard by typing \'quit\' anytime you want."}
            await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Graphic**__`, description: graphicSetupMessage, footer: {text: "Type \'quit\' to quit wizard..."}}))
            try {
                var dimensionGraphic = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
            } catch(err) {
                console.log("ERROR UPDATING DIMENSION - GRAPHIC: \n" + err)
            }
            if(dimensionGraphic.first().content === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
            // check if link is valid
            var isMedia = await functions.toolkit.isMediaURL(dimensionGraphic.first().content.toString())
            graphicAttempt = true;
        } while (!isMedia)
        var updatedGraphic = dimensionGraphic.first().content.toString();

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

        await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Password**__`, description: `Enter the new \'password\' of the <@&${dimensionID}> dimension™:`, footer: {text: "Type \'quit\' to quit wizard..."}}))
        try {
            var dimensionPassword = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR UPDATING DIMENSION - PASSWORD: \n" + err)
        }
        if(dimensionPassword.first().content === "quit") {msg.channel.send("You quit the dimensions™ update wizard."); return }
        var updatedPassword = dimensionPassword.first().content.toString();

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

        var officerAttempt = false;
        do {
            var officerSetupMessage = `Mention the new \'officer role\' for the <@&${dimensionID}> dimension™.`;
            if(officerAttempt) {officerSetupMessage = `Invaild input! You must mention the role that you want to set as <@&${dimensionID}>'s officer role.`}
            await msg.channel.send(new RichEmbed({title: `__**Update Dimension™: Officer Role**__`, description: officerSetupMessage, footer: {text: "Type \'quit\' to quit wizard..."}}))
            try {
                var dimensionOfficer = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
            } catch(err) {
                console.log("ERROR UPDATING DIMENSION - OFFICER ROLE: \n" + err)
            }
            if(dimensionOfficer.first().content === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
            // check if link is valid
            var isRole = false;
            if(dimensionOfficer.first().mentions) {
                if(dimensionOfficer.first().mentions.roles.array().length > 0) {
                    isRole = true;
                }
            }
            officerAttempt = true;
        } while (!isRole)
        var updatedOfficer = dimensionOfficer.first().mentions.roles.first().id;

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