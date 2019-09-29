const botSettings = require("../botSettings.json"); 
const functions = require("../functions.js");
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
}; 

module.exports.run = async (client, oldMember, newMember) => {
    
    if (newMember.user.id === client.user.id) return;

    // there is one of these in functions.processes.teleport. Do something about it
    if (client.indicators.teleporting.includes(oldMember.user.id)) return;

    // console.log("made it passed teleport check")


    const addedRoles = newMember.roles.keyArray().diff(oldMember.roles.keyArray());
    const deletedRoles = oldMember.roles.keyArray().diff(newMember.roles.keyArray());

    var doesInclude = false;
    for(var i = 0; i < addedRoles.length; i++) {
        if(client.cache.dimensions.keyArray().includes(addedRoles[i])) {
            doesInclude = true;
            await functions.processes.teleport(client, addedRoles[i], oldMember, newMember);
            // var dimensionName = await client.guilds.get(botSettings.guild).roles.get(addedRoles[i]).name;
            // console.log(`ADDED A DIMENSION ROLE: ${dimensionName}`);
            return;
        }
    }

    // 2. 

}

module.exports.help = {
    name: "guildMemberUpdate"
}