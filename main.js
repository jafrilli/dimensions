const Discord = require("discord.js");
const botSettings = require("./botSettings.json");
const fs = require("fs");
const mongoose = require("mongoose");
const client = new Discord.Client();

client.commands = new Discord.Collection();
client.usingCommand = [];

mongoose.connect('mongodb://localhost:27017/dimensionsDB', { useNewUrlParser: true }).then(console.log("\nSUCCESSFULLY CONNECTED TO MONGO DB"));

// 1. DIMENSION CREATE MUST MAKE A NEW DIMENSION ROLE FROM SCRATCH
// 2. DIMENSION UPDATE WIZARD {WHAT WOULD U LIKE TO UPDATE}
// 3. GET STARTED WITH ROLE SAVING - '>dimension addRole <dimension> <role>'
// 4. MAKE A GLOBAL FUNCTION THAT UPDATES PORTAL EVERY TIME THERE IS A CHANGE (CREATE/DELETE)

client.on("ready", async () => {
    console.log("\n================== READY START ==================")
    
    // logged in
    console.log(`Logged in as ${client.user.username}!`);
    // generate invite
    var invite = await client.generateInvite(["ADMINISTRATOR"]);
    console.log(invite);
    // set bot user activity
    await client.user.setActivity(botSettings.activity.description, {type: botSettings.activity.type})
    console.log(`Set activity to \"${botSettings.activity.type} ${botSettings.activity.description}\"`)

    console.log("=================== READY END ===================")
})

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