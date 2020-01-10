var Member = require("../classes/member.js");
var { MessageEmbed } = require("discord.js");

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
        case "exp":
            await incrementExp(msg, client, args);
            removedID();
            break;
        case "money":
            await incrementMoney(msg, client, args);
            removedID();
            break;
        case "visits":
            await incrementVisits(msg, client, args);
            removedID();
            break;
        case "stats":
            await viewStats(msg, client, args);
            removedID();
            break;
        default:
            await msg.channel.send(`That was an invalid argument. Try again dumbass <@${msg.author.id}>`)
            removedID();
            return;
    }
}

module.exports.help = {
    name: "my"
}

async function incrementExp(msg, client, args) {
    var amount = parseInt(args[1]);
    var member = new Member(msg.author.id);
    await member.changeExp(amount);
    await member.init();

    msg.channel.send("💥 " + "**" + member.exp ? member.exp : 0 + "**");
}

async function incrementMoney(msg, client, args) {
    var amount = parseInt(args[1]);
    var member = new Member(msg.author.id);
    await member.changeMoney(amount);
    await member.init();

    msg.channel.send("💰 " + "**" + member.money ? member.money : 0 + "**");
}

async function incrementVisits(msg, client, args) {
    var member = new Member(msg.author.id);
    await member.incrementVisits();
    await member.init();

    msg.channel.send(`🔮 **${member.visits ? member.visits : 0}**`)
}

async function viewStats(msg, client, args) {
    var member;
    if(!args[1]) {
        member = new Member(msg.author.id)
    } else {
        if(msg.mentions.users) {
            member = new Member(msg.mentions.users.first().id);
        } else {
            return msg.channel.send("You must either @ a user or write \'>my stats\' for your own stats inbred.")
        }
    }
    await member.init();
    // create the embed
    var embed = new MessageEmbed({
        title: "**User Stats**",
        description: "Here are your stats (this should be replaced by a graphic soon)",
        fields: [
            {
                name: "💥",
                value: `**${member.exp ? member.exp : 0}**`,
                inline: true
            },
            {
                name: "💰",
                value: `**${member.money ? member.money : 0}**`,
                inline: true
            },
            {
                name: "🔮",
                value: `**${member.visits ? member.visits : 0}**`,
                inline: true
            },
        ]
    });
    embed.setColor('DARK_RED');

    msg.channel.send(embed);
}

// the sky is the limit from here. add as many user-specific stuff as you want