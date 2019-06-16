const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Discord.Client();

client.on("ready", async () => {
    console.log("=================== READY START ===================");
    
    // logged in
    console.log(`Logged in as ${client.user.username}`);
    // generate invite
    var invite = await client.generateInvite(["ADMINISTRATOR"])
    console.log(invite);
    // set bot user activity
    await client.user.setActivity(config.activity.description, {type: config.activity.action});
    console.log(`Set activity to: ${config.activity.action} ${config.activity.description}`);
    
    console.log("==================== READY END ====================");
})

client.login(config.token);