var botSettings = require("../botSettings.json");
var df = require("../classes/dimensionFuncs.js");
var functions = require("../functions.js");
var { RichEmbed } = require("discord.js");

module.exports.run = async (msg, client, args) => {

    if(msg.channel.type == 'dm') return;

    if(client.indicators.usingCommand.includes(msg.author.id)) {
        await msg.channel.send("You are already using a command (setup wizard, etc.). Finish that command before starting another one. B-BAKA!!!");
        return;
    }

    //! this part does two things
    // 1. checks if user is an officer, or has an officer role
    // 2. sets the officer's dimension to officerDimension
    var officerDimension;
    for(var i = 0; i < client.cache.dimensions.keyArray().length; i++) {
        var currentDimension = client.cache.dimensions.array()[i];
        if(currentDimension.officerRole) {
            if(msg.member.roles.keyArray().includes(currentDimension.officerRole)) {
                officerDimension = currentDimension["_id"];
                break;
            }
        }
    }

    if(!officerDimension) return msg.channel.send("You must be an officer to use this command!");

    
    client.indicators.usingCommand.push(msg.author.id);
    function removedID() {
        client.indicators.usingCommand = client.indicators.usingCommand.filter(user => user != msg.author.id)
    }

    switch (args[0]) {
        case "ban":
            await dimensionBan(msg, client, args, officerDimension);
            removedID();
            break;
        case "unban":
            await dimensionUnban(msg, client, args, officerDimension);
            removedID();
            break;
        case "announce":
            await dimensionAnnouncment(msg, client, args, officerDimension);
            removedID();
            break;
        default:
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "mod"
}


async function dimensionBan(msg, client, args, officerDimension) {
    var errorMsg = `Please mention the user you want to ban from <@&${officerDimension}> after the command. EX: \'>manage ban @someone\'`
    if(msg.mentions.users.size < 1) return msg.channel.send(errorMsg);
    var userToBan = msg.mentions.users.first().id;
    if(userToBan == msg.author.id) return msg.channel.send("u cant ban urself dumbass");

    await df.dimensionUpdate(
        client, 
        officerDimension,
        "bans",
        userToBan,
        // replace with an error embed
        (err) => {console.log("could not ban user | err: " + err); msg.channel.send("could not ban user. contact admin + developer asap ;-;")},
        (doc) => {
            msg.channel.send(`Banned <@${userToBan}> from the <@&${officerDimension}> dimension!`)
            //! KICK THE USER OUT OF THE DIMENSION (MUST MANUALLY TELEPORT)
        },
        true,
        false
    )
}

async function dimensionUnban(msg, client, args, officerDimension) {
    var errorMsg = `Please mention the user you want to unban from <@&${officerDimension}> after the command. EX: \'>manage ban @someone\'`
    if(msg.mentions.users.size < 1) return msg.channel.send(errorMsg);
    var userToBan = msg.mentions.users.first().id;
    if(userToBan == msg.author.id) return msg.channel.send("u cant unban urself dumbass");

    await df.dimensionUpdate(
        client, 
        officerDimension,
        "bans",
        userToBan,
        // replace with an error embed
        (err) => {console.log("could not unban user | err: " + err); msg.channel.send("could not ban user. contact admin + developer asap ;-;")},
        (doc) => {msg.channel.send(`Unbanned <@${userToBan}> from the <@&${officerDimension}> dimension!`)},
        false,
        true
    )
}

async function dimensionAnnouncment(msg, client, args, officerDimension) {

    // step 1: prompt for an announcement
    await msg.channel.send(new RichEmbed({
        title: "__**New Dimension™ Announcement**__",
        description: "Type your announcement",
        footer: {text: "Type \'quit\' to quit the process."}
    }));
    try {
        var announcementMsg = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
    } catch(err) {
        console.log("ERROR AWAITING ANNOUNCEMENT TO MAKE DIMENSION ANNOUNCEMENT IN dimensionAnnouncment: \n" + err)
    }
    var announcement = announcementMsg.first().content;
    if(announcement === "quit") { msg.channel.send("You quit the dimensions™ announcement wizard."); return }

    // step 2: prompt for a graphic (make sure its a url too)
    var graphicAttempt = false;
    do {
        var graphicSetupMessage = `Enter the new \'graphic\' **url** for the announcement, if you want it to have one. If you don't, just type \'skip\'. The url must end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__:`;
        if(graphicAttempt) {graphicSetupMessage = "Invaild input! The __url__ **must** end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. Type \'skip\' if you don't want one."}
        await msg.channel.send(new RichEmbed({title: `__**Announcement Graphic**__`, description: graphicSetupMessage, footer: {text: "Type \'skip\' if you don't want one, or \'quit\' to quit wizard..."}}))
        try {
            var dimensionGraphic = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR UPDATING DIMENSION - GRAPHIC: \n" + err)
        }
        if(dimensionGraphic.first().content.toLowerCase() === "quit") {msg.channel.send("You quit the dimensions™ setup wizard."); return }
        if(dimensionGraphic.first().content.toLowerCase() === "skip") {break;}
        // check if link is valid
        var isMedia = await functions.toolkit.isMediaURL(dimensionGraphic.first().content.toString())
        graphicAttempt = true;
    } while (!isMedia)
    var announcementGraphic = dimensionGraphic.first().content.toLowerCase() != "skip" ? dimensionGraphic.first().content.toString() : null;

    // step 3: confirm announcement
    var confirmAttempted = false
    do {
        var confirmMessage = `Are you sure you want to post the following annoucement for the <@&${officerDimension}> dimension? Type \'confirm\' to confirm this action. Otherwise, type \'quit\' to quit this process.`
        if(confirmAttempted) {confirmMessage = "Incorrect response! Type \'confirm\' to confirm the post of the announcement. Otherwise, type \'quit\' to quit this process."}
        await msg.channel.send(confirmMessage);
        var announcementEmbed = await functions.embed.dimension.announcementEmbed(
            officerDimension,
            msg,
            client,
            {
                text: announcement,
                graphic: announcementGraphic
            }
        )
        console.log(announcementEmbed.description);
        await msg.channel.send(announcementEmbed);
        try {
            var confirmation = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, {max: 1})
        } catch(err) {
            console.log("ERROR CONFIRMING THE POSTING OF AN ANNOUNCEMENT: \n" + err)
        }
        if(confirmation.first().content === "quit") { msg.channel.send("You quit the dimensions™ announcement wizard."); return }
        confirmAttempted = true;
    } while (confirmation.first().content.toLowerCase() != "confirm")

    // step 4: post announcement
    try {
        var announcementChannel = client.guilds.get(botSettings.guild).channels.get(botSettings.announcements);
        announcementChannel.send(announcementEmbed);
    } catch (err) {
        functions.embed.errors.catch(err, client);
        return;
    }
    msg.channel.send(`Successfully posted the announcement on <#${botSettings.announcements}>!`);
}

// // returns a bool, with true being user in right dimension and false the opposite
// async function checkUserInRightDimension(client, user, officerDimension) {
//     var member = client.guilds.get(botSettings.guild).members.get(user);
//     var memberRolesArray = member.roles.array()
//     for(var i=0; i<memberRolesArray.length; i++) {
//         if(client.cache.dimensions.keyArray().includes(memberRolesArray[i])) {
//             if(memberRolesArray[i] === officerDimension) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }