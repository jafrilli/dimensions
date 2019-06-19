const { RichEmbed } = require("discord.js");
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
    await msg.channel.send(new RichEmbed({title: "New Dimension: Name", description: "Enter the \'name\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
    try {
        var dimensionTitle = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR CREATING DIMENSION - TITLE: \n" + err)
    }
    if(dimensionTitle.first().content === "quit") {creationQuitted(msg); return }
    newDimension.name = dimensionTitle.first().content;

    // Set Description: 
    await msg.channel.send(new RichEmbed({title: "New Dimension: Description", description: "Enter the \'description\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
    try {
        var dimensionDescription = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR CREATING DIMENSION - DESCRIPTION: \n" + err)
    }
    if(dimensionDescription.first().content === "quit") {creationQuitted(msg); return }
    newDimension.description = dimensionDescription.first().content;

    // Set Description: 
    await msg.channel.send(new RichEmbed({title: "New Dimension: Description", description: "Enter the \'description\' of the new dimension you wish to create:", footer: "Type \'quit\' to quit wizard anytime..."}))
    try {
        var dimensionRole = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR CREATING DIMENSION - DESCRIPTION: \n" + err)
    }
    if(dimensionRole.first().content === "quit") {creationQuitted(msg); return }
    newDimension.role = dimensionRole.first().content;

    // Set Color: 
    await msg.channel.send(new RichEmbed({title: "New Dimension: Color", description: "Enter the hex \'color\' of the new dimension IN THIS FORMAT: \'#000000\'", footer: "Type \'quit\' to quit wizard anytime..."}))
    try {
        var dimensionColor = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR CREATING DIMENSION - COLOR: \n" + err)
    }
    if(dimensionColor.first().content === "quit") {creationQuitted(msg); return }
    if(!dimensionColor.first().content.startsWith("#")) {message.channel.send("You need to add the hashtag (#), plus 6 digits. Try Again."); return }
    var theDimensionColor = converter.hexToDec(dimensionColor.first().content.replace("#", "0x"));
    newDimension.color = theDimensionColor;

    // Set Emoji: 
    await msg.channel.send(new RichEmbed({title: "New Dimension: Emoji", description: "Enter the unicode \'emoji\' of the new dimension you wish to create:", color: theDimensionColor, footer: "Type \'quit\' to quit wizard anytime..."}))
    try {
        var dimensionEmoji = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR CREATING DIMENSION - EMOJI: \n" + err)
    }
    if(dimensionEmoji.first().content === "quit") {creationQuitted(msg); return }
    newDimension.emoji = dimensionEmoji.first().content;


    // Rich embed (finalizing)
    const dimensionEmbed = new RichEmbed({
        title: "__**Dimension™ Details:**__",
        color: newDimension.color,
        fields: [
            {name: "**Title**", value: newDimension.name},
            {name: "**Description**", value: newDimension.description},
            {name: "**Color**", value: newDimension.color},
            {name: "**Emoji**", value: newDimension.emoji}
        ],
    })
    await msg.channel.send(dimensionEmbed);


    function creationQuitted(message) {
        message.channel.send("You quit the dimensions™ setup wizard.");
        return;
    }
}

async function dimensionDelete(msg, client, args) {
    
}