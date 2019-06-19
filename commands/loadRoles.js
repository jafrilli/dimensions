const { RichEmbed } = require("discord.js");
const Role = require("../models/role.js");

module.exports.run = (msg, client, args) => {

    let responseEmbed = new RichEmbed({
        title: "DB Response",
        color: 10181046
    })

    const startTime = new Date();

    var guildRoles = [];
    msg.guild.roles.forEach((role) => {
        guildRoles.push({
            _id: role.id,
            name: role.name
        })
    })

    Role.insertMany(guildRoles, (err, docs) => {
        if(err) {
            console.log(err);
            return;
        }
        //console.log(docs);
        const timeTook = (new Date()) - startTime;
        msg.channel.send(`Process took ${timeTook} milliseconds!`)

        docs.forEach((role) => {
            responseEmbed.addField(role.name, `ID: ${role.id}`)
        })
        msg.channel.send(responseEmbed)
        msg.channel.send(`Successfully loaded all \`${docs.length}\` server roles to a db!`)
    })
}

module.exports.help = {
    name: "load"
}