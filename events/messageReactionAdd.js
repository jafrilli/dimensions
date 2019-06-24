const botSettings = require("../botSettings.json");  

module.exports.run = async (client, reaction) => {
    
    // FUTURE UPDATES: make it so that it only teleports 
    // when it reacts to the right emote. 
    // But for now, depend on "no reactions" from the portal channel.


    // if(reaction.message.channel.id === botSettings.portal && reaction.message.embeds) {

    if(reaction.message.embeds.length != 0 && !reaction.message.author.bot) {
        if(reaction.message.embeds[0].fields.length != 0) {
            var fieldData = {};
            reaction.message.embeds[0].fields.forEach(field => {
                fieldData[field.name] = field.value;
            })
            if(Object.keys(fieldData).includes("**Role**")) {
                // split these two (dimensionID and .test() to practice caching my data. if it causes errors then dont use it)
                var dimensionID = fieldData["**Role**"].slice(3, -1);
                var isValidID = /^\d+$/.test(dimensionID);
                if(isValidID) {
                    console.log("is a valid number");
                    // SUCCESS CODE GOES HERE (REACTED TO PROPER MESSAGE, SO ADD TELEPORT CODE HERE)
                }
                else {
                    console.log("not a valid number")
                    // FALURE CODE GOES HERE (nothing is perferred);
                }
            }
            // if no field has the **Role** field then return;
            else {
                console.log("RETURNING");
                return;
            }
        }
    }
    //}
}

module.exports.help = {
    name: "messageReactionAdd"
}