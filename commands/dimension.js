const { RichEmbed, Role } = require("discord.js");
const Dimension = require("../models/dimension.js");
const converter = require("hex2dec");
const functions = require("../functions.js");


module.exports.run = async (msg, client, args) => {

    if(client.usingCommand.includes(msg.author.id)) {
        await msg.channel.send("You are already using a command (setup wizard, etc.). Finish that command before starting another one. B-BAKA!!!");
        return;
    }
    client.usingCommand.push(msg.author.id);
    function removedID() {
        client.usingCommand = client.usingCommand.filter(user => user != msg.author.id)
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
        case 'oioioi':
            functions.dimension.details('591342226693685263', msg);
            removedID()
            break;
        default:
            msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            return;
    }
}

module.exports.help = {
    name: "dimension"
}

// CRUD Operations for Dimensions
async function dimensionCreate(msg, client, args) {
    
    var newDimension = await createDimensionSequence(msg);
    if(!newDimension) {
        msg.channel.send("A problem was encountered while making a new dimension ;-;. Contact developer...")
    };

    // Create new dimension™ role:
    try{
        var newRole = await msg.guild.createRole({
            name: `『${newDimension.name}』`,
            color: newDimension.color,
            mentionable: false
        })
    } catch (err) {
        msg.channel.send("There was a problem making the role in the \'>dimension create\' process. Please contact the developer.").catch(
            console.log("ERROR TRYING TO SEND THE ERROR MESSAGE WHILE creating new role for new dimension: \n" + err)
        );
        return;
    }
    
    newDimension["_id"] = newRole.id;
    newDimension.roles = [];

    // Rich embed (finalizing)
    const dimensionEmbed = new RichEmbed({
        title: "__**New Dimension™ Details:**__",
        description: "Successfully created a new dimension™ role and database entry.",
        thumbnail: {url: newDimension.emoji.url},
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

    Dimension.create(newDimension, (err, docs) => {
        if(err) {
            console.log("ERROR WHEN SAVING DIMENSION USING DIMENSION CREATE: \n" + err);
            return;
        }
        if(docs) {
            msg.channel.send(`Successfully created the \'${docs.name}\' dimension!`)
        }
    });

}

async function dimensionUpdate(msg, client, args) {
}

async function dimensionDelete(msg, client, args) {
    
    const embed = new RichEmbed()

    var allDimensions = {};
    // will be structured like this { "nameOfRole": "idOfRole", "nameOfRole": "idOfRole", etc... }
    // 1. connect to the db, get all dimensions
    await Dimension.find({}, {name: 1}, (err, docs) => {
        if(err) {
            console.log("ERROR TRYING TO RETRIEVE DIMENSIONS FOR DIMENSIONDELETE(): \n" + err);
            return;
        }
        if(docs) {
            docs.forEach((doc) => {
                allDimensions[doc.name] = doc["_id"];
                embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
            })

        }
    })

    // 2. set variables for rich embed (mention role using <$&>) with fields
    embed.setTitle("__**Dimension™ Delete Wizard**__");
    //embed.setColor(converter.hexToDec("0xDB3BFE"));
    
    // 3. ask/send embed, and wait for appropriate answer
    var deleteAttempted = false;
    do {
        var condition = false;
        // description
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

    // 5. delete dimension using its id
    Dimension.findByIdAndDelete(selectedDimensionID, (err, doc) => {
        if(err) {
            console.log("ERROR DELETING DIMENSION BY ID (MONGOOSE/MONGODB ERROR): \m" + err);
            return;
        }
        msg.channel.send(`Successfully deleted the ${doc.name} dimension™ from the database, along with its roles!`);
    })
}

async function dimensionList(msg, client, args) {
    
    const embed = new RichEmbed();
    embed.setTitle("__**Dimension™ List**__");
    embed.setDescription("Here's a list of all the existing dimensions. Type \'>dimension create\' to create a dimension, and type \'>dimension delete\' to delete one.")

    await Dimension.find({}, {name: 1}, (err, docs) => {
        if(err) {
            console.log("ERROR RETRIEVING DIMENSION DATA FOR DIMENSIONLIST FUNCTION: \n" + err)
            return;
        }
        if(docs) {
            docs.forEach(doc => {
                embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
            })
        }
    })

    await msg.channel.send(embed);

}

async function createDimensionSequence(msg) {

    var newDimension = {}

    // Set Title:
    do {
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Name**__", description: "Enter the \'name\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
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
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Description**__", description: "Enter the \'description\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
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
        await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Color**__", description: colorSetupMessage, footer: "Type \'quit\' to quit wizard anytime..."}))
        try {
            var dimensionColor = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - COLOR: \n" + err)
        }
        if(dimensionColor.first().content === "quit") {creationQuitted(msg); return }
        colorAttempted = true;
    } while (!dimensionColor.first().content.startsWith("#") || dimensionColor.first().content.length > 7)
    var theDimensionColor = parseInt(converter.hexToDec(dimensionColor.first().content.replace("#", "0x")));
    newDimension.color = theDimensionColor;


    // Set Emoji:
    var emojiAttempted = false
    do {
        var emojiSetupMessage = "React to this message with an \'emote\' **FROM THIS SERVER** you want to use for the new dimension™:";
        if(emojiAttempted) {emojiSetupMessage = "You need to use a custom emote from this server, and it cannot be a default emote, like :joy: Try Again."}
        var emojiRequest = await msg.channel.send(new RichEmbed({title: "__**New Dimension™: Emoji**__", description: emojiSetupMessage, color: theDimensionColor, footer: "Type \'quit\' to quit wizard anytime..."}))
        try{
            var dimensionEmoji = await emojiRequest.awaitReactions(reaction => reaction.users.first().id === msg.author.id, {maxEmojis: 1});
        }catch(err){
            console.log("ERROR CREATING DIMENSION - EMOJI: \n" + err)

        }
        emojiAttempted = true
    } while (!dimensionEmoji.first().emoji.id && !dimensionEmoji.first().emoji.url)
    newDimension.emoji = {
        id: dimensionEmoji.first().emoji.id,
        url: dimensionEmoji.first().emoji.url
    }
    

    function creationQuitted(message) {
        message.channel.send("You quit the dimensions™ setup wizard.");
        return;
    }
    
    return newDimension;
}
