const botSettings = require("../botSettings.json");

module.exports.run = async (client) => {
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
}
module.exports.help = {
    name: "ready"
}