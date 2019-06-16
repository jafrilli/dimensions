module.exports.run = (msg, client, args) => {
    msg.channel.send(`<@${msg.author.id}>\'s mmm avatar:`, {files: [msg.author.avatarURL]});
}
// THIS NAME IS VERY IMPORTANT
module.exports.help = {
    name: "avatar"
}