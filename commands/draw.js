const graphics = require('../graphics.js');

module.exports.run = async (msg, client, args) => {
    var attachment = await graphics.profile(msg);
    msg.channel.send("", attachment);
}
// THIS NAME IS VERY IMPORTANT
module.exports.help = {
    name: "draw"
}