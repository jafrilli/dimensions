var botSettings = require("../botSettings.json");
var df = require("../classes/dimensionFuncs.js");

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
        default:
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "manage"
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