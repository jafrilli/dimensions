const botSettings = require("../botSettings.json"); 
const functions = require("../functions.js");
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
}; 

module.exports.run = async (client, oldMember, newMember) => {
    
    if (newMember.user.id === client.user.id) return;
    if (client.indicators.teleporting.includes(oldMember.user.id)) return;

    console.log("made it passed teleport check")

    // 1. make a list of all the dimension role ids
    const addedRoles = newMember.roles.keyArray().diff(oldMember.roles.keyArray());
    const deletedRoles = oldMember.roles.keyArray().diff(newMember.roles.keyArray());

    var doesInclude = false;
    for(var i = 0; i < addedRoles.length; i++) {
        if(client.cache.dimensions.keyArray().includes(addedRoles[i])) {
            doesInclude = true;
            await functions.processes.teleport(client, addedRoles[i], oldMember, newMember);
            return;
        }
    }

    // 2. 

}

module.exports.help = {
    name: "guildMemberUpdate"
}