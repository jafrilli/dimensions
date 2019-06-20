const { RichEmbed, Role } = require("discord.js");
const Dimension = require("../models/dimension.js");
const converter = require("hex2dec");

module.exports.run = async (msg, client, args) => {
    switch (args[0]) {
        case "create":
            dimensionCreate(msg, client, args);
            break;
        case "delete":
            dimensionDelete(msg, client, args);
            break;
        default:
            msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            return;
    }
}

module.exports.help = {
    name: "dimension"
}


async function dimensionCreate(msg, client, args) {
    
    var newDimension = {}

    // Set Title:
    do {
        await msg.channel.send(new RichEmbed({title: "New Dimension: Name", description: "Enter the \'name\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
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
        await msg.channel.send(new RichEmbed({title: "New Dimension: Description", description: "Enter the \'description\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
        try {
            var dimensionDescription = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - DESCRIPTION: \n" + err)
        }
        if(dimensionDescription.first().content === "quit") {creationQuitted(msg); return }
        newDimension.description = dimensionDescription.first().content;
    } while (typeof newDimension.description != 'string')

    // Set Role: 
    var roleAttempted = false;
    do {
        var roleSetupMessage = "Enter the official dimension \'role\' of the new dimension you wish to create:";
        if(roleAttempted) {roleSetupMessage = "Your response has to be a single, mentioned __role__ dumbass. If you can't do it, then type \'quit\' to exit the setup wizard."};
        await msg.channel.send(new RichEmbed({title: "New Dimension: Role", description: roleSetupMessage, footer: "Type \'quit\' to quit wizard anytime..."}))
        try {
            var dimensionRole = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - DESCRIPTION: \n" + err)
        }
        if(dimensionRole.first().content === "quit") {creationQuitted(msg); return }
        roleAttempted = true;
    } while (!dimensionRole.first().mentions.roles.first())
    newDimension.role = dimensionRole.first().mentions.roles.first().id;

    // Set Color: 
    var colorAttempted = false;
    do {
        var colorSetupMessage = "Enter the hex \'color\' of the new dimension IN THIS FORMAT: \'#000000\'";
        if(colorAttempted) {colorSetupMessage = "You need to add the hashtag (#), plus 6 digits. Try Again."}
        await msg.channel.send(new RichEmbed({title: "New Dimension: Color", description: colorSetupMessage, footer: "Type \'quit\' to quit wizard anytime..."}))
        try {
            var dimensionColor = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - COLOR: \n" + err)
        }
        if(dimensionColor.first().content === "quit") {creationQuitted(msg); return }
        colorAttempted = true;
    } while (!dimensionColor.first().content.startsWith("#") || dimensionColor.first().content.length > 7)
    var theDimensionColor = converter.hexToDec(dimensionColor.first().content.replace("#", "0x"));
    newDimension.color = theDimensionColor;

    // Set Emoji: 
    do {
        await msg.channel.send(new RichEmbed({title: "New Dimension: Emoji", description: "Enter the unicode \'emoji\' of the new dimension you wish to create:", color: theDimensionColor, footer: "Type \'quit\' to quit wizard anytime..."}))
        try {
            var dimensionEmoji = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CREATING DIMENSION - EMOJI: \n" + err)
        }
        if(dimensionEmoji.first().content === "quit") {creationQuitted(msg); return }
    } while (!dimensionEmoji.first().content)
    newDimension.emoji = dimensionEmoji.first().content;

    newDimension["_id"] =  newDimension.role;
    newDimension.roles = [];

    // Rich embed (finalizing)
    const dimensionEmbed = new RichEmbed({
        title: "__**Dimension™ Details:**__",
        color: newDimension.color,
        fields: [
            {name: "**Title**", value: newDimension.name},
            {name: "**Description**", value: newDimension.description},
            {name: "**Role**", value: `<@&${newDimension.role}>`},
            {name: "**Color**", value: newDimension.color},
            {name: "**Emoji**", value: newDimension.emoji},
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

    function creationQuitted(message) {
        message.channel.send("You quit the dimensions™ setup wizard.");
        return;
    }
}

async function dimensionDelete(msg, client, args) {
    
    var allDimensions;
    var dimensionIDs = [];
    // 1. connect to the db, get all dimensions
    await Dimension.find({}, {name: 1}, (err, docs) => {
        if(err) {
            console.log("ERROR TRYING TO RETRIEVE DIMENSIONS FOR DIMENSIONDELETE(): \n" + err);
            return;
        }
        if(docs) {
            allDimensions = docs
        }
    })

    // 2. rich embed (mention role using <$&>) with fields
    var embed = new RichEmbed({
        title: "__**Dimension™ List**__",
        color: converter.hexToDec("0xDB3BFE"),
    })
    allDimensions.forEach((doc) => {
        embed.addField(`**${doc.name}**`, `<@&${doc["_id"]}>`);
        dimensionIDs.push(doc["_id"]);
    })
    var deleteAttempted = false;
    do {
        // description
        var dimensionDeleteMessage = "Mention the role **(ONLY ONE)** of the dimension from this list you want to delete, or type \'quit\' to stop this process:";
        if(deleteAttempted) {
            dimensionDeleteMessage = "Incorrect response! Response must be a mention of one of the dimensions on this list! Try again, or type \'quit\' to stop this process:"
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

    } while (!dimensionToDelete.first().mentions.roles.first().id || !dimensionIDs.includes(dimensionToDelete.first().mentions.roles.first().id));
    var selectedDimensionID = dimensionToDelete.first().mentions.roles.first().id;

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

    Dimension.findByIdAndDelete(selectedDimensionID, (err, doc) => {
        if(err) {
            console.log("ERROR DELETING DIMENSION BY ID (MONGOOSE/MONGODB ERROR): \m" + err);
            return;
        }
        msg.channel.send(`Successfully deleted the ${doc.name} dimension™ from the database, along with its roles!`);
    })
}