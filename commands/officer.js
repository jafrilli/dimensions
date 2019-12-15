const botSettings = require("../botSettings.json");
const df = require("../classes/dimensionFuncs.js");
const functions = require("../functions.js");
const { RichEmbed } = require("discord.js");
const wizard = require("../wizard.js");


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
    var officerRole;
    for(var i = 0; i < client.cache.dimensions.keyArray().length; i++) {
        var currentDimension = client.cache.dimensions.array()[i];
        if(currentDimension.officerRole) {
            if(msg.member.roles.keyArray().includes(currentDimension.officerRole)) {
                officerDimension = currentDimension["_id"];
                officerRole = currentDimension.officerRole;
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
            await dimensionBan(msg, client, args, officerDimension, officerRole);
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
        case "welcome":
            await dimensionWelcomeMessage(msg, client, args, officerDimension);
            removedID();
            break;
        case "create":
            await createDimensionRole(msg, client, args, officerDimension);
            removedID();
            break;
        case "remove":
            await removeDimensionRole(msg, client, args, officerDimension, officerRole);
            removedID();
            break;
        case "reposition":
            await repositionRole(msg, client, args, officerDimension, officerRole);
            removedID();
            break;
        case "help":
            await modHelp(msg, client, args, officerDimension);
            removedID();
            break;
        default:
            await msg.channel.send(`That was an invalid argument. Use \'>mod help\' to see different commands.`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "mod"
}


async function dimensionBan(msg, client, args, officerDimension, officerRole) {
    var errorMsg = `Please mention the user you want to ban from <@&${officerDimension}> after the command. EX: \'>manage ban @someone\'`
    if(msg.mentions.users.size < 1) return msg.channel.send(errorMsg);
    var userToBan = msg.mentions.users.first().id;
    if(userToBan == msg.author.id) return msg.channel.send("u cant ban urself dumbass");
    if(client.guilds.get(botSettings.guild).members.get(userToBan).roles.keyArray().includes(officerRole)) {
        return msg.channel.send("You can't ban another officer!")
    }
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
    let quitMessage = "You quit the dimensions™ announcement wizard.";
    
    // step 1: prompt for an announcement
    let announcement = await wizard.type.text(
        msg, 
        client,
        false,
        null,
        {
            title: "__**New Dimension™ Announcement**__",
            description: "Type your announcement",
        },
    );
    if(announcement === false) {return msg.channel.send(quitMessage);}

    // step 2: prompt for a graphic (make sure its a url too)
    let announcementGraphic = await wizard.type.graphic(
        msg, 
        client,
        true,
        null,
        {
            title: "__**Announcement Graphic**__",
            description: "Enter the new \'graphic\' **url** for the announcement, if you want it to have one. If you don't, just type \'skip\'. The url must end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__:",
        },
        {
            title: "__**Announcement Graphic**__",
            description: "Invaild input! The __url__ **must** end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. Type \'skip\' if you don't want one.",
        },
    );
    if(announcementGraphic === false) {return msg.channel.send(quitMessage);}

    // create the embed
    let announcementEmbed = await functions.embed.dimension.announcementEmbed(
        officerDimension,
        msg,
        client,
        {
            text: announcement,
            graphic: announcementGraphic
        }
    );

    // step 3: confirm announcement
    let announcementConfirmation = await wizard.type.confirmation(
        msg,
        client,
        `Are you sure you want to post the following annoucement for the <@&${officerDimension}> dimension? Type \'confirm\' to confirm this action. Otherwise, type \'quit\' to quit this process.`,
        "Incorrect response! Type \'confirm\' to confirm the post of the announcement. Otherwise, type \'quit\' to quit this process.",
        async (mesg) => {
            return mesg.channel.send(announcementEmbed);
        }
    );
    if(announcementConfirmation === false) {return msg.channel.send(quitMessage);}

    
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

async function dimensionWelcomeMessage(msg, client, args, officerDimension) {
    // Set Title:
    var newWelcomeEmbed = {
        embed: {}
    };
    let quitMessage = `You quit the <@&${officerDimension}> dimension's welcome message setup wizard.`

    var welcomeChannel = await wizard.type.mention.channel(
        msg,
        client,
        false,
        null,
        {
            title: "__**Welcome Channel**__",
            description: "Mention the \'channel\' of the welcome embed:",
        },
    );
    if(welcomeChannel === false) {return msg.channel.send(quitMessage);}
    newWelcomeEmbed.channel = welcomeChannel.id;

    newWelcomeEmbed.embed.title = await wizard.type.text(
        msg, 
        client,
        true,
        null,
        {
            title: "__**Welcome Title**__",
            description: "Type in the \'title\' of the welcome embed. Use \'<<user>>\' to mention the user:",
        },
    );
    if(newWelcomeEmbed.embed.title === false) {return msg.channel.send(quitMessage);}

    // Set Description: 
    newWelcomeEmbed.embed.description = await wizard.type.text(
        msg, 
        client,
        false,
        null,
        {
            title: "__**Welcome Description**__",
            description: "Type in the \'description\' of the welcome embed. Use \'<<user>>\' to mention the user:",
        },
    );
    if(newWelcomeEmbed.embed.description === false) {return msg.channel.send(quitMessage);}

    newWelcomeEmbed.embed.graphic = await wizard.type.graphic(
        msg, 
        client,
        true,
        null,
        {
            title: "__**Welcome Graphic**__",
            description: "Enter the new \'graphic\' **url** for the welcome embed. The url must end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. You can skip this step:",
        },
        {
            title: "__**Welcome Graphic**__",
            description: "Invaild input! The __url__ **must** end with either a __\'.gif\', \'.png\', \'.jpg\', or a \'.jpeg\'__. You can skip this step by typing \'skip\', or exit the update wizard by typing \'quit\' anytime you want.",
        },
    );
    if(newWelcomeEmbed.embed.graphic === false) {return msg.channel.send(quitMessage);}

    await df.dimensionUpdate(
        client,
        officerDimension,
        "welcome",
        newWelcomeEmbed,
        (err) => {functions.embed.errors.catch(err, client)},
        (doc) => {msg.channel.send(`Successfully updated the <@&${officerDimension}> dimension's welcome message!`)}
    );
}

async function createDimensionRole(msg, client, args, officerDimension) {

    var roleName = await wizard.type.text(
        msg,
        client,
        false,
        null,
        {
            title: "__**New Dimension™ Role: Name**__",
            description: "Type the name of the new role."
        },
        {
            title: "__**New Dimension™ Role: Name**__",
            description: "Type the name of the new role."
        },
    )
    if(roleName === false) return msg.channel.send("Ended dimension™ role creation.")

    var roleColor = await wizard.type.color(
        msg,
        client,
        true,
        null,
        {
            title: "__**New Dimension™ Role: Color**__",
            description: "Enter the hex \'color\' of the new role IN THIS FORMAT: \'#000000\'. This will also be the color of your dimension role."
        },
        {
            title: "__**New Dimension™ Role: Color**__",
            description: "Needs to be a valid hex color. You need to add the hashtag (#), plus 6 digits. You can skip this step by typing \'skip\'."
        },
    )
    if(roleColor === false) return msg.channel.send("Ended dimension™ role creation.")
    if(roleColor != null) roleColor = parseInt(functions.toolkit.converter.hexToDec(roleColor.replace("#", "0x")));


    var rolePositionObj = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**New Dimension™ Role: Placement**__",
            description: "Type the __**name**__ of the role the new role should be placed under. By that logic, you can't place roles higher than the officer role."
        },
        {
            title: "__**New Dimension™ Role: Placement**__",
            description: "Invalid input! You should type the __**name**__ of one of these roles the new role should be placed under. By that logic, you can't place roles higher than the officer role."
        }
    );
    if(rolePositionObj === false) return msg.channel.send("Ended dimension™ role creation.");

    try{
        var newRole = await msg.guild.createRole({
            name: roleName,
            color: roleColor,
            mentionable: false,
            position: rolePositionObj.calculatedPosition,
            hoist: true,
        })
    } catch (err) {
        functions.embed.errors.catch(err, client);
        console.log("There was an issue creating a role (officer role creation)");
        return;
    }

    await df.dimensionUpdate(
        client,
        officerDimension,
        "roles",
        newRole.id,
        (err) => {console.log("Could not add new role made by officer to db")},
        (doc) => {msg.channel.send(`Successfully created the <@&${newRole.id}> role for the <@&${officerDimension}> dimension!`)},
        true,
        false
    )
}

async function removeDimensionRole(msg, client, args, officerDimension, officerRole) {
    
    var roleToDelete = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**Remove Dimension™ Role**__",
            description: `Type the __**name**__ of the role you want to remove from the <@&${officerDimension}> dimension™. You obviously cannot delete the officer role, even though it's on the list.`
        },
        {
            title: "__**Remove Dimension™ Role**__",
            description: "Type the __**name**__ of the role you want to remove from your dimension™. You obviously cannot delete the officer role, even though it's on the list."
        }
    );
    if(roleToDelete === false) return msg.channel.send("Ended dimension™ role deletion.");
    
    if(roleToDelete.id == officerRole) return msg.channel.send("You cannot remove the officer role! Ended wizard.")

    await df.dimensionUpdate(
        client,
        officerDimension,
        "roles",
        roleToDelete.id,
        (err) => {functions.embed.errors.catch(err, client)},
        (doc) => {msg.channel.send(`Successfully removed the <@&${roleToDelete.id}> role from the dimension's role list!`)},
        false,
        true
    )
}

async function repositionRole(msg, client, args, officerDimension, officerRole) {
    var roleToReposition = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**Reposition Dimension™ Role: Role**__",
            description: `Type the __**name**__ of the role you want to reposition from the <@&${officerDimension}> dimension™. You cannot reposition the officer role, even though it's on the list.`
        },
        {
            title: "__**Reposition Dimension™ Role: Role**__",
            description: "Incorrect input! Type the __**name**__ of the role you want to reposition from your dimension™. You cannot reposition the officer role, even though it's on the list."
        }
    );
    if(roleToReposition === false) return msg.channel.send("Ended dimension™ role repositioning.");

    if(roleToReposition.id == officerRole) return msg.channel.send("You cannot reposition the officer role! Contact an admin if you need to. Ended wizard.")

    var roleToPlaceUnder = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**Reposition Dimension™ Role: Position**__",
            description: `Type the __**name**__ of the role you want to place the <@&${roleToReposition.id}> role under. By that logic, you cannot place a role higher than the officer role.`
        },
        {
            title: "__**Reposition Dimension™ Role: Position**__",
            description: `Incorrect input! Type the __**name**__ of the role you want to place the <@&${roleToReposition.id}> role under. By that logic, you cannot place a role higher than the officer role.`
        }
    );
    if(roleToPlaceUnder === false) return msg.channel.send("Ended dimension™ role repositioning.");
    
    var selectedRole = client.guilds.get(botSettings.guild).roles.get(roleToReposition.id);
        
    selectedRole.setPosition(roleToPlaceUnder.calculatedPosition-1)
        .then(updated => msg.channel.send(`Successfully repositioned the <@&${roleToReposition.id}> role!`))
        .catch(err => {
            functions.embed.errors.catch(err, client)
            return msg.channel.send("There was an error. Contact admin!");
        });

}

async function modHelp(msg, client, args, officerDimension) {
    const embed = new RichEmbed({
        title: "__**Mod Commands Help**__",
        description: "All of these commands __do not__ need arguments (text after them) **EXCEPT BAN & UNBAN**. They are all setup wizards. Type \'quit\' at anytime during the setup wizard to cancel the process (EXCEPT IN THE EMOJI/REACT PHASE. STILL WORKING ON THAT).",
        fields: [
            {name: ">mod ban", value: `Bans a member from <@&${officerDimension}>.`},
            {name: ">mod unban", value: `Unbans a member from <@&${officerDimension}>.`},
            {name: ">mod announce", value: `Takes you through a setup wizard for a <@&${officerDimension}> announcement.`},
            {name: ">mod welcome", value: `Takes you through a setup wizard that helps setup a welcome message for <@&${officerDimension}>.`},
            {name: ">mod create", value: `Setup wizard for a new role for <@&${officerDimension}>.`},
            {name: ">mod remove", value: `Setup wizard to delete a role from <@&${officerDimension}>.`},
            {name: ">mod reposition", value: `Setup wizard to reposition a role from <@&${officerDimension}>.`},
            {name: ">mod help", value: `Lists all available commands (this)`},
        ]
    });

    await msg.channel.send(embed);
    await msg.channel.send("Done :3")
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