const botSettings = require("../botSettings.json");
const df = require("../classes/dimensionFuncs.js");
const functions = require("../functions.js");
const { MessageEmbed } = require("discord.js");
const wizard = require("../wizard.js");
const { updateFunctions } = require("./dimension.js");


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
        case "role": 
            await modRole(msg, client, args, officerDimension, officerRole);
            removedID();
            break;
        case "help":
            await modHelp(msg, client, args, officerDimension);
            removedID();
            break;
        case "rr": 
            await modRRCreate(msg, client, args, officerDimension, officerRole);
            removedID();
            break;
        case "dimension":
            await dimensionUpdate(msg, client, args, officerDimension);
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

// role series
async function modRole(msg, client, args, officerDimension, officerRole) {
    if(args[1]) {
        switch(args[1]) {
            case "create":
                await createRole(msg, client, args, officerDimension);
                break;
            case "delete":
                await deleteRole(msg, client, args, officerDimension, officerRole);
                break;
            case "update":
                await updateRole(msg, client, args, officerDimension, officerRole);
                break;
            case "remove":
                await removeRole(msg, client, args, officerDimension);
                break;
            case "give": 
                await giveRole(msg, client, args, officerDimension);
                break;
            case "help": 
                await roleHelp(msg, client, args, officerDimension);
                break;
            default:
                await msg.channel.send(`That was an invalid '>mod role' argument. Use \'>mod role help\' to see different commands regarding roles`)
                return;
        }
    } else {
        msg.channel.send(`Type \'>mod role help\' for everything related to roles!`);
    }
}
async function createRole(msg, client, args, officerDimension) {

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
            description: "Type the __**number**__ of the role the new role should be placed under. By that logic, you can't place roles higher than the officer role."
        },
        {
            title: "__**New Dimension™ Role: Placement**__",
            description: "Invalid input! You should type the __**number**__ of one of these roles the new role should be placed under. By that logic, you can't place roles higher than the officer role."
        }
    );
    if(rolePositionObj === false) return msg.channel.send("Ended dimension™ role creation.");

    try{
        var newRole = await msg.guild.roles.create({
            data: {
                name: roleName,
                color: roleColor,
                mentionable: false,
                position: rolePositionObj.position,
                hoist: true,
            }
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
async function deleteRole(msg, client, args, officerDimension, officerRole) {
    
    var roleToDelete = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**Remove Dimension™ Role**__",
            description: `Type the __**number**__ of the role you want to remove from the <@&${officerDimension}> dimension™. You obviously cannot delete the officer role, even though it's on the list.`
        },
        {
            title: "__**Remove Dimension™ Role**__",
            description: "Type the __**number**__ of the role you want to remove from your dimension™. You obviously cannot delete the officer role, even though it's on the list."
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
async function updateRole(msg, client, args, officerDimension, officerRole) {
    var roleToUpdate = await wizard.type.positionedDimensionRole(
        msg,
        client,
        officerDimension,
        {
            title: "__**Update Dimension™ Role: Role**__",
            description: `Type the __**number**__ of the role you want to update from the <@&${officerDimension}> dimension™. You cannot reposition the officer role, even though it's on the list.`
        },
        {
            title: "__**Update Dimension™ Role: Role**__",
            description: "Incorrect input! Type the __**number**__ of the role you want to update from your dimension™. You cannot reposition the officer role, even though it's on the list."
        }
    );
    if(roleToUpdate === false) return msg.channel.send("Ended dimension™ role updating.");

    if(roleToUpdate.id == officerRole) return msg.channel.send("You cannot edit the officer role! Contact an admin if you need to. Ended wizard.")
    
    const updateOptions = [
        "name",
        "color",
        "position",
        "hoist",
        // "password",
        // "officer"
    ]
    var whatToUpdateAttempted = false;
    do {
        var whatToUpdateDescription = `Here's a list of things you can update on the <@&${roleToUpdate.id}> role. Type what you want to update (not case-sensitive dw :3), or type \'quit\' to stop this process:`;
        if(whatToUpdateAttempted) {
            whatToUpdateDescription = "Your answer has to be one of the following settings! Try again, or type \'quit\' to stop this process:"
        }
        await msg.channel.send(new MessageEmbed({
            description: whatToUpdateDescription,
            fields: [
                // MAKE SURE TO UPDATE updateOptions[] ABOVE IF U UPDATE THIS ARRAY
                {name: "Name", value: "Name of the role", inline: true},
                {name: "Color", value: "Color of the role", inline: true},
                {name: "Position", value: "Position of the role (allows you to reposition it)", inline: true},
                {name: "Hoist", value: "Toggle whether the role is hoisted or not", inline: true},
                // {name: "Password", value: "Password of the dimension™ (not an option during creation)", inline: true},
                // {name: "Officer", value: "Officer role of the dimension™ (not an option during creation)", inline: true}
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
            await updateTheRole.updateName(roleToUpdate, msg, client);
            // console.log("name")
            break;
        case "color":
            await updateTheRole.updateColor(roleToUpdate, msg, client);
            // console.log("color")
            break;
        case "position":
            await updateTheRole.updatePosition(roleToUpdate, msg, client, officerDimension);
            // console.log("emoji")
            break;
        case "hoist": 
            await updateTheRole.updateHoist(roleToUpdate, msg, client);
            // console.log("graphic")
            break;
        default: 
            console.log("super weird error. you should literally never get this. like ever. mod role")
            break;
    }
}
var updateTheRole = {
    updateName: async (roleToUpdate, msg, client) => {
        var newName = await wizard.type.text(
            msg, client, false, " ", 
            {title: "__**Update Dimension™ Role: Name**__", description: "Enter the new name of the role:"}
        );
        if(newName === false) return msg.channel.send("Ended dimension™ role updating.")

        var selectedRole = client.guilds.get(botSettings.guild).roles.get(roleToUpdate.id);

        try {
            await selectedRole.edit({name: newName});
        } catch (err) {return functions.embed.errors.catch(err, client)}

        return msg.channel.send(`Successfully updated the name of the <@&${selectedRole.id}> role!`)
    },
    updateColor: async (roleToUpdate, msg, client) => {
        var newColor = await wizard.type.color(
            msg, client, false, false, 
            {title: "__**Update Dimension™ Role: Color**__", description: "Enter the new color of the role in hex form. You **must** add a \'#\' in front of the hexadecimal. EX: \'#FFFFFF\':"}
        );
        if(newColor === false) return msg.channel.send("Ended dimension™ role updating.")
        
        var selectedRole = client.guilds.get(botSettings.guild).roles.get(roleToUpdate.id);
        
        try {
            await selectedRole.edit({color: newColor});
        } catch (err) {return functions.embed.errors.catch(err, client)}

        return msg.channel.send(`Successfully updated the color of the <@&${selectedRole.id}> role!`)
    },
    updatePosition: async (roleToUpdate, msg, client, officerDimension) => {
        var roleToPlaceUnder = await wizard.type.positionedDimensionRole(
            msg,
            client,
            officerDimension,
            {
                title: "__**Update Dimension™ Role: Position**__",
                description: `Type the __**number**__ of the role you want to place the <@&${roleToUpdate.id}> role under. By that logic, you cannot place a role higher than the officer role.`
            },
            {
                title: "__**Update Dimension™ Role: Position**__",
                description: `Incorrect input! Type the __**number**__ of the role you want to place the <@&${roleToUpdate.id}> role under. By that logic, you cannot place a role higher than the officer role.`
            }
        );
        if(roleToPlaceUnder === false) return msg.channel.send("Ended dimension™ role updating.");
        
        var selectedRole = client.guilds.get(botSettings.guild).roles.get(roleToUpdate.id);
            
        selectedRole.setPosition(roleToPlaceUnder.position-1)
            .then(updated => msg.channel.send(`Successfully repositioned the <@&${roleToUpdate.id}> role!`))
            .catch(err => {
                functions.embed.errors.catch(err, client)
                return msg.channel.send("There was an error. Contact admin!");
            });
    },
    updateHoist: async (roleToUpdate, msg, client) => {
        var shouldHoist = await wizard.type.yesno(
            msg, client, false, false, 
            {title: "__**Update Dimension™ Role: Hoist**__", description: "Do you want the role to be hoisted? Enter \'yes\' or \'no\':"},
            {title: "__**Update Dimension™ Role: Hoist**__", description: "Your answer **must** be either \'yes\' or \'no\'. Do you want the role to be hoisted?:"}
        );
        if(shouldHoist === false) return msg.channel.send("Ended dimension™ role updating.")
        shouldHoist = shouldHoist.toLowerCase() == 'yes' ? true : false;

        var selectedRole = client.guilds.get(botSettings.guild).roles.get(roleToUpdate.id);

        try {
            await selectedRole.edit({hoist: shouldHoist});
        } catch (err) {return functions.embed.errors.catch(err, client)}
        return msg.channel.send(`Successfully set hoist for the <@&${selectedRole.id}> role to ${shouldHoist}!`)
    },
}
async function giveRole(msg, client, args, officerDimension) {

    do {
        var isValidUser = false;
        var user = await wizard.type.mention.user(
            msg, client, false, null,
            {title: "**Give Role: User**", description: "Mention the user you want to give the role to!"},
            {title: "**Give Role: User**", description: "Invalid input! **You have to @ the user** you want to give the role to!"},
        );
        if(user === false) return msg.channel.send("Ended the adding role wizard...");
        
        var member = msg.guild.members.get(user.id);
        if(!member.roles.has(officerDimension)) return msg.channel.send("User must be in your dimension...");
        else {isValidUser = true}

    } while (isValidUser == false)

    var roleToGive = await wizard.type.positionedDimensionRole(
        msg, client, officerDimension,
        {title: "**Give Role: Role**", description: "Type in the **number** of the role you would like to give <@"+user.id+">."},
        {title: "**Give Role: Role**", description: "Incorrect response! Type in the **number** next to the role name of the role you would like to give <@"+user.id+">."},
    );
    if(roleToGive === false) return msg.channel.send("Ended the adding role wizard...");

    try {
        await member.roles.add(msg.guild.roles.get(roleToGive.id));
    } catch(err) {
        functions.embed.errors.catch(err, client)
        return msg.channel.send("There was an error giving the user a role!");
    }

    return msg.channel.send(`Successfully gave <@${member.id}> the <@&${roleToGive.id}> role!`);
}
async function removeRole(msg, client, args, officerDimension) {

    do {
        var isValidUser = false;
        var user = await wizard.type.mention.user(
            msg, client, false, null,
            {title: "**Remove Role: User**", description: "Mention the user you want to remove a role from!"},
            {title: "**Remove Role: User**", description: "Invalid input! **You have to @ the user** you want to remove the role from!"},
        );
        if(user === false) return msg.channel.send("Ended the removing role wizard...");
        
        var member = msg.guild.members.get(user.id);
        if(!member.roles.has(officerDimension)) return msg.channel.send("User must be in your dimension...");
        else {isValidUser = true}

    } while (isValidUser == false)

    var roleToRemove = await wizard.type.userDimensionRoles(
        msg, client, officerDimension, user.id, 
        {title: "Remove Role: Role", description: "Type in the **number** next to the role you would like to remove from <@"+user.id+">."},
        {title: "Remove Role: Role", description: "Incorrect response! Type in the **number** next to the role you would like to remove from <@"+user.id+">."}
    );
    if(roleToRemove === false) return msg.channel.send("Ended the removing role wizard...");

    try {
        await member.roles.remove(msg.guild.roles.get(roleToRemove.id));
    } catch(err) {
        functions.embed.errors.catch(err, client)
        return msg.channel.send("There was an error removing a role from the user!");
    }

    return msg.channel.send(`Removed the <@&${roleToRemove.id}> role from <@${member.id}>!`);
}
async function roleHelp(msg, client, args, officerDimension) {
    const embed = new MessageEmbed({
        title: "__**Mod ROLE Commands Help**__",
        description: "All of these commands __do not__ need arguments (text after them). They are all setup wizards. Type \'quit\' at anytime during the setup wizard to cancel the process.",
        fields: [
            {name: ">mod role create", value: `Setup wizard for a new role for <@&${officerDimension}>.`},
            {name: ">mod role delete", value: `Setup wizard to delete a role from <@&${officerDimension}>.`},
            {name: ">mod role update", value: `Setup wizard to update a role from <@&${officerDimension}>.`},
            {name: ">mod role give", value: `Setup wizard for giving role to user in the <@&${officerDimension}> dimension.`},
            {name: ">mod role remove", value: `Setup wizard for removing role from user in the <@&${officerDimension}> dimension.`},
            {name: ">mod role help", value: `Lists all available commands (this)`},
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

async function modHelp(msg, client, args, officerDimension) {
    const embed = new MessageEmbed({
        title: "__**Mod Commands Help**__",
        description: "All of these commands __do not__ need arguments (text after them) **EXCEPT BAN & UNBAN**. They are all setup wizards. Type \'quit\' at anytime during the setup wizard to cancel the process (EXCEPT IN THE EMOJI/REACT PHASE. STILL WORKING ON THAT).",
        fields: [
            {name: ">mod role help", value: `FOR ALL <@&${officerDimension}> ROLE COMMANDS`},
            {name: ">mod ban <@user>", value: `Bans a member from <@&${officerDimension}>.`},
            {name: ">mod unban <@user>", value: `Unbans a member from <@&${officerDimension}>.`},
            {name: ">mod announce", value: `Takes you through a setup wizard for a <@&${officerDimension}> announcement.`},
            {name: ">mod welcome", value: `Takes you through a setup wizard that helps setup a welcome message for <@&${officerDimension}>.`},
            {name: ">mod rr", value: `Setup wizard for creating a reaction role message in the <@&${officerDimension}> dimension.`},
            {name: ">mod dimension", value: `Allows you to change <@&${officerDimension}> details like the name, description, color, etc...`},
            {name: ">mod help", value: `Lists all available commands (this)`},
        ]
    });

    await msg.channel.send(embed);
    await msg.channel.send("Done :3")
}

async function modRRCreate(msg, client, args, officerDimension, officerRole) {
    const quit = () => msg.channel.send("Reaction role embed wizard ended...");
    const customEmojiRegEx = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
    const roleRegEx = /<?@&(\d{17,19})>?/;
    const emojiRegEx = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    // channel
    do {
        var validChannel = false;
        var channel = await wizard.type.mention.channel(
            msg, client, false, null, 
            {title: "Reaction Roles: Channel", description: "Mention the channel the reaction role embed is going to be in. It must be a channel within your jurisdiction as an officer:"},
            {title: "Reaction Roles: Channel", description: "Must **mention** the channel (#channel) **that you have control over** that the reaction role embed is going to be in:"}
        );
        if(channel === false) return quit();
        
        if(channel.permissionOverwrites.get(officerRole)) {
            if(channel.permissionOverwrites.get(officerRole).allow.has(['MANAGE_CHANNELS'])) validChannel = true;
            else msg.channel.send("The channel you select must be within your control as an officer! Try again!");
            
        } else {msg.channel.send("The channel you select must be within your control as an officer! Try again!");}

    } while(validChannel == false);

    // title
    var title = await wizard.type.text(
        msg, client, true, null, {title: "Reaction Roles: Title", description: "Title of the embed:"}
    );
    if (title === false) return quit();

    // description
    var description = await wizard.type.text(
        msg, client, true, null, {title: "Reaction Roles: Description", description: "Description of the embed:"}
    );
    if (description === false) return quit();

    // color
    var color = await wizard.type.color(
        msg, client, true, null, {title: "Reaction Roles: Color", description: "(skippable) Enter the hex code of the color of the embed (hashtag included) like \'#FFFFFF\'."},
        {title: "Reaction Roles: Color", description: "WRONG INPUT (skippable) Enter the hex code of the color of the embed (hashtag included) like \'#FFFFFF\'."}
    )

    // loop until 'done' ask for emote | role
    var rrObject = {};
    do {
        var response = await wizard.default(
            msg, client, false, null, 
            {
                title: "Reaction Roles: Emotes and Roles",
                description: "Type the reaction and the role in this format: \'<emoji> | <@role>\'. \nThe emoji **must** either be a standard emoji, or a custom emoji from **this** server. If not, it will be replaced with ❓.",
                footer: {text: "Type \'done\' when you are done, or \'quit\' to exit the wizard..."}
            }, 
            (message) => {
                if (message.content.toLowerCase() == 'done') return 'done';
                if (message.content.toLowerCase() == 'quit') return 'quit';
                // ! [DONE] make sure that the role is not an admin or mod role
                var customEmoji = message.content.match(customEmojiRegEx);
                var emoji = message.content.match(emojiRegEx);
                var role = message.content.match(roleRegEx);
                if(!role && (!emoji || !customEmoji)) return 'invalid_input';
                // if user is not admin
                // if(!msg.author.permissions.has(['ADMINISTRATOR'])) {
                //     // check if role has power
                //     if(isModAdmin(msg, channel, role[role.length-1])) return msg.channel.send('Cannot add a role with high permissions! Try again!');
                // }
                var roleAboutToAdd = role[role.length-1];
                if(!client.cache.dimensions.get(officerDimension).roles.includes(roleAboutToAdd)) return 'invalid_role';
                if(customEmoji == null && emoji == null) return 'no_emoji';
                if(role == null) return 'no_role';
                // ! [WORKING] do this step when making the actual embed and reacting
                if(customEmoji) {if(!message.guild.emojis.get(customEmoji[3]) && !emoji) emoji = ['❓']}
                // ? customEmoji[3] might cause errors if something changes to string.match()
                rrObject[(emoji ? emoji[0] : customEmoji[3])] = role[role.length-1];
                msg.channel.send("Successfully added a reaction role! Type \'done\' if you're done, or add another one!");
            }, 
        );
        if(response == 'invalid_input') msg.channel.send("That was an invalid input! Try again!");
        if(response == 'invalid_role') msg.channel.send("That is an invalid role! The role must be within your jurisdiction!");
        if(response == 'no_emoji') msg.channel.send("You're missing an emoji! Try again!");
        if(response == 'no_role') msg.channel.send("You're missing a role! Mention a role. Try again!");
        if(response == 'quit') return quit();
    } while (response != 'done');

    // list roles under description
    var shouldList = await wizard.type.yesno(
        msg, client, false, false, {title: "Add Role List?", description: "Would you like to list the roles and their emojis under your description? Respond \'yes\' or \'no\'!"},
        {title: "Add Role List?", description: "Invalid Response! You must respond with either \'yes\' or \'no\' on whether you would like to list the roles and their emojis under your description."}
    );
    if (shouldList === false) return quit();
    shouldList = shouldList.toLowerCase() == 'yes' ? true : false;

    // generate role list
    var roleList = "\n";
    shouldList ? Object.keys(rrObject).forEach(emojiId => {
        if(msg.guild.emojis.get(emojiId)) {
            var emoji = msg.guild.emojis.get(emojiId)
            var str = "<";
            emoji.animated ? str += 'a' : '';
            roleList += `${str}:${emoji.name}:${emojiId}> | <@&${rrObject[emojiId]}>\n`;
        } else {
            roleList += `${emojiId} | <@&${rrObject[emojiId]}>\n`;
        }
    }) : null;

    var rrEmbed = new MessageEmbed();
    rrEmbed.setTitle(title ? title : "");
    rrEmbed.setDescription(shouldList ? (description ? description + roleList : roleList) : (description ? description : ""));
    rrEmbed.setColor(color);
    var rrEmbMsg = await msg.guild.channels.get(channel.id).send(rrEmbed);

    var reactionRole = {};
    reactionRole["_id"] = rrEmbMsg.id
    reactionRole.type = "normal"
    reactionRole.reactionRoles = rrObject;

    Object.keys(rrObject).forEach((key) => {
        if(key.match(emojiRegEx)) rrEmbMsg.react(key);
        else rrEmbMsg.react(msg.guild.emojis.get(key));
    })

    await functions.db.add(
        client,
        client.models.rrmessage,
        reactionRole,
        (err) => {return functions.embed.errors.catch(err, client)},
        (docs) => {}
    )

    msg.channel.send(`Successfully created a new reaction role message in the <#${channel.id}> channel!`);
}

// ! dimensions update should always be the last in the list of funcs due to its size
async function dimensionUpdate(msg, client, args, officerDimension) {
    
    // select a dimension
    const selectedDimensionID = officerDimension;

    await functions.embed.dimension.detailedDetails(selectedDimensionID, msg, client);
    const updateOptions = [
        "name",
        "description",
        "color",
        "emoji",
        "graphic",
        // "password",
        // "officer"
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
                // {name: "Password", value: "Password of the dimension™ (not an option during creation)", inline: true},
                // {name: "Officer", value: "Officer role of the dimension™ (not an option during creation)", inline: true}
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
        // case "password": 
        //     await updateFunctions.updatePassword(selectedDimensionID, msg, client);
        //     // console.log("password")
        //     break;
        // case "officer": 
        //     await updateFunctions.updateOfficer(selectedDimensionID, msg, client);
        //     // console.log("officer")
        //     break;
        default: 
            console.log("super weird error. you should literally never get this. like ever")
            break;
    }
}
