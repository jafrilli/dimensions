const Discord = require("discord.js");
const botSettings = require("./botSettings.json");
const fs = require("fs");
const client = new Discord.Client();

client.commands = new Discord.Collection();
// add env., add fs system, add db and start working with the algorithms on how the role system will work...

fs.readdir("./commands/", (err, files) => {
    if(err) {
        console.log("ERROR READING ./commands/ PATH");
        return;
    };
    console.log(files);
    console.log(`Found ${files.length} file(s)!`);
    files.forEach((file) => {
        if(!file.endsWith(".js")) return;
        var cmd = require(`./commands/${file}`);
        var cmdName = cmd.help.name;
        client.commands.set(cmdName, cmd);
        console.log(`Loaded the \'${cmdName}\' command!`)
    })
})

client.on("ready", async () => {
    console.log("================== READY START ==================")
    
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

client.on("message", (msg) => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith(botSettings.prefix)) return;
    
    var command = msg.content.substring(1).split(" ")[0];
    var args = msg.content.substring(1).split(" ").slice(1);

    let cmd = client.commands.get(command);
    if(!cmd) return;
    cmd.run(msg, client, args);

})

client.login(botSettings.token);