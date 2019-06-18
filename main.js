const Discord = require("discord.js");
const botSettings = require("./botSettings.json");
const fs = require("fs");
const client = new Discord.Client();

client.commands = new Discord.Collection();

// 1. ADD EVENT HANDLER SYSTEM LIKE WHAT NERD DID (DONE)
// 2. GET STARTED ON DATABASE 

fs.readdir("./commands/", (err, files) => {
    if(err) {
        console.log("ERROR READING ./commands/ PATH");
        return;
    };
    // console.log(files);
    console.log(`Found ${files.length} file(s)!`);
    files.forEach((file) => {
        if(!file.endsWith(".js")) return;
        var cmd = require(`./commands/${file}`);
        var cmdName = cmd.help.name;
        client.commands.set(cmdName, cmd);
        console.log(`Loaded the \'${cmdName}\' command!`)
    })
})

fs.readdir("./events/", (err, files) => {
    if(err) {
        console.log("ERROR READING ./events/ PATH");
        return;
    };
    console.log(`\nFound ${files.length} event(s)!`)
    files.forEach((file) => {
        if(!file.endsWith(".js")) return;
        var event = require(`./events/${file}`);
        client.on(event.help.name, event.run.bind(null, client));
        console.log(`Setup response for the \'${event.help.name}\' event!`)
    })
})

client.login(botSettings.token);