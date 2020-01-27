const functions = require('../functions.js');

module.exports.run = async (client, msg) => {

    // To delete the rrmsg from the database if the message is deleted
    try{
        await isNormalRRMsg(client, msg);
    } catch (err) {functions.embed.errors.catch(err, client)}

}

async function isNormalRRMsg(client, msg) {
    const rrmsg = client.cache.rrmessages.get(msg.id);
    // is message a rrmessage?
    if(!rrmsg) return;
    if(rrmsg.type != 'normal') return;
    await functions.db.delete.one(
        client,
        client.models.rrmessage,
        {"_id": msg.id},
        (err) => {functions.embed.errors.catch(err, client)},
        (doc) => {console.log('this was a success')}
    );
}

module.exports.help = {
    name: 'messageDelete'
}