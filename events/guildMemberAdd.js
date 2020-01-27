const functions = require('../functions.js');

module.exports.run = async (client, member) => {
    if(member.user.bot) return;
    const time = 4000;
    var toggle = true;

    if(member.roles.array().length == 1 && toggle) {
        setTimeout(async () => {
            if(client.cache.dimensions.first()) {
                try {
                    await member.roles.add(client.cache.dimensions.firstKey())
                } catch (err) {
                    functions.embed.errors.catch(err, client);
                }
            }
        }, time)
    }
}

module.exports.help = {
    name: 'guildMemberAdd'
}