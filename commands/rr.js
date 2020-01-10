const { RichEmbed } = require("discord.js");
const functions = require("../functions.js");
const {graphics} = require("../graphics.js");
const wizard = require("../wizard.js");

module.exports.run = async (msg, client, args) => {
    
    if(client.indicators.usingCommand.includes(msg.author.id)) {
        await msg.channel.send("You are already using a command (setup wizard, etc.). Finish that command before starting another one. B-BAKA!!!");
        return;
    }

    if(msg.channel.type == 'dm') return;

    
    client.indicators.usingCommand.push(msg.author.id);
    function removedID() {
        client.indicators.usingCommand = client.indicators.usingCommand.filter(user => user != msg.author.id)
    }

    switch (args[0]) {
        case "create": 
            await rrCreate(msg, client, args);
            removedID();
            break;
        case "delete":
            await rrDelete(msg, client, args);
            removedID();
            break;
        case "link":
            await rrLink(msg, client, args);
            removedID();
            break;
        case "buffer":
            await graphicTest(msg, client, args);
            removedID();
            break;
        default:    
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "rr"
}


async function rrCreate(msg, client, args) {
    const quit = () => msg.channel.send("reaction role embed wizard ended");
    const customEmojiRegEx = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
    const roleRegEx = /<?@&(\d{17,19})>?/;
    const emojiRegEx = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    // channel
    var channel = await wizard.type.mention.channel(
        msg, client, false, null, 
        {title: "Mention the channel the reaction role embed is going to be in:"},
        {title: "Must **mention** the channel (#channel) the reaction role embed is going to be in:"}
    );
    if(channel === false) return quit();

    // title
    var title = await wizard.type.text(
        msg, client, true, null, {title: "Title of the embed:"}
    );
    if (title === false) return quit();

    // description
    var description = await wizard.type.text(
        msg, client, true, null, {title: "Description of the embed:"}
    );
    if (description === false) return quit();

    // color
    var color = await wizard.type.color(
        msg, client, true, null, {title: "(skippable) Enter the hex code of the color of the embed (hashtag included) like \'#FFFFFF\'."},
        {title: "WRONG INPUT (skippable) Enter the hex code of the color of the embed (hashtag included) like \'#FFFFFF\'."}
    )

    // loop until 'done' ask for emote | role
    var rrObject = {};
    do {
        var response = await wizard.default(
            msg, client, false, null, 
            {
                title: "**Add Reactions and Roles**",
                description: "Type the reaction and the role in this format: \'<emoji> | <@role>\'. \nThe emoji **must** either be a standard emoji, or a custom emoji from **this** server. If not, it will be replaced with ❓.",
                footer: {text: "Type \'done\' when you are done, or \'quit\' to exit the wizard..."}
            }, 
            (message) => {
                if (message.content.toLowerCase() == 'done') return 'done';
                // ! make sure that the role is not an admin or mod role
                var customEmoji = message.content.match(customEmojiRegEx);
                var emoji = message.content.match(emojiRegEx);
                var role = message.content.match(roleRegEx);
                if(customEmoji == null && emoji == null) return 'no_emoji';
                if(role == null) return 'no_role';
                // ! do this step when making the actual embed and reacting
                if(customEmoji) {if(!message.guild.emojis.get(customEmoji[3]) && !emoji) emoji = ['❓']}
                // ? customEmoji[3] might cause errors if something changes to string.match()
                rrObject[(emoji ? emoji[0] : customEmoji[3])] = role[role.length-1];
                
            }, 
        );
        if(response == 'no_emoji') msg.channel.send("You're missing an emoji! Try again!");
        if(response == 'no_role') msg.channel.send("You're missing a role! Mention a role. Try again!");
    } while (response != 'done');

    var rrEmbed = new RichEmbed();
    rrEmbed.setTitle(title ? title : "");
    rrEmbed.setDescription(description ? description : "");
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
        (err) => {console.log("There was an error trying to add normal reaction role data to database")},
        (docs) => {}
    )

    console.log(rrObject);
}

async function rrDelete(msg, client, args) {

}

async function rrLink(msg, client, args) {
    await functions.processes.refreshPortals(client)
}

function graphicTest(msg, client, args) {
    graphics.dimension().then(buffer => {
        console.log(buffer)
        msg.channel.send(" ", {file: buffer});
    }).catch(error => {
        functions.embed.errors.catch(error);
    })
}