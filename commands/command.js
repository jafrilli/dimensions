module.exports.run = (msg, client, args) => {
    msg.channel.send(isModAdmin(msg, client, msg.author.id) ? 'is mod' : 'is not mod');
}
function isModAdmin(msg, client, roleID) {
    for (let i = 0; i < client.cache.dimensions.length; i++) {
        const obj = client.cache.dimensions[i];
        if(roleID == obj.officerRole) return true;
    }
    if(msg.guild.members.get(roleID).permissions.has(['KICK_MEMBERS','BAN_MEMBERS'])) return true;

    return false;
}
// THIS NAME IS VERY IMPORTANT
module.exports.help = {
    name: "perms"
}