const { Client, Collection } = require("discord.js");
const botSettings = require("./botSettings.json");
const fs = require("fs");
const functions = require("./functions.js");
const mongoose = require("mongoose");
const client = new Client();
const shell = require('shelljs');
var schedule = require('node-schedule');
 
// daily backup
const fileLocation = '~';
const rule = new schedule.RecurrenceRule();
rule.hour = 22;
rule.minute = 0;

var j = schedule.scheduleJob(rule, () => {
    const date = new Date();
    const fileName = date.getMonth()+1 + "" + date.getDate() + "" + date.getFullYear();
    const command = "mongodump --db=dimensionsDB --archive=" + fileName + " --gzip";
    shell.cd(fileLocation);
    shell.exec(command);
});

client.commands = new Collection();
client.indicators = {
    teleporting: [],
    usingCommand: []
}
// cache and related;
// ITS SUPER IMPORTANT THAT THESE NAMES RESEMBLE THE COLLECTION NAMES (you use schema.collection.name) in recache
client.cache = {
    dimensions: new Collection(),
    members: new Collection(),
    rrmessages: new Collection()
}
client.couldNotCache = {
    dimensions: false,
    members: false,
    rrmessages: false
}
// models
client.models = {
    dimension: require("./models/dimension.js"),
    member: require("./models/member.js"),
    rrmessage: require("./models/rrmessage.js")
}


mongoose.connect('mongodb://localhost:27017/dimensionsDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("\nSUCCESSFULLY CONNECTED TO MONGO DB"))
    .catch(err => {
        if(err) {
            console.log("\nCONNECTION TO MONGO DB FAILED: \n" + err)
        }
    });
        // DISABLE ALL DB RELATED FUNCTIONS, OR FIND A WAY TO RESTART USING CODE (client.isConnected = false, if(!client.isConnected) return;)

client.models.dimension.find({}, async (err, docs) => {
    if(err) {
        console.log("Could not initially (before client ready) cache dimension data.");
        client.couldNotCache.dimensions = true;
        return;
    }
    if(docs) {
        await docs.forEach(doc => {
            client.cache.dimensions.set(doc["_id"], doc);
        })
        console.log("Initially cached the \'dimensions\' collection!")
    }
})
client.models.member.find({}, async (err, docs) => {
    if(err) {
        console.log("Could not initially (before client ready) cache members data.");
        client.couldNotCache.members = true;
        return;
    }
    if(docs) {
        await docs.forEach(doc => {
            // for the teleport cooldown feature
            doc.lastTeleport = new Date();
            client.cache.members.set(doc["_id"], doc);
            
        })
        console.log("Initially cached the \'members\' collection!")
    }
})
client.models.rrmessage.find({}, async (err, docs) => {
    if(err) {
        console.log("Could not initially (before client ready) cache rrmessage data.");
        client.couldNotCache.rrmessages = true;
        return;
    }
    if(docs) {
        await docs.forEach(doc => {
            client.cache.rrmessages.set(doc["_id"], doc);
        })
        console.log("Initially cached the \'rrmessages\' collection!");
    }
})


// recent: add client.connect and client.models in the ready thing so if it restarts, the db is recached


// DO SOMETHING WITH THE couldNotCache boolean (restrict functions);
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
    // refresh portals
    functions.processes.refreshPortals(client);
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