const botSettings = require("../botSettings.json");
const functions = require("../functions.js");
const Member = require("../classes/member.js");

module.exports = {
    // ! consider merging the two; might limit functionality though
    onDimensionEnter: async (client, newDimensionID, member) => {
        var dimension = client.cache.dimensions.get(newDimensionID);
        if(dimension.welcome) {
            var welcomeChannel = client.guilds.get(botSettings.guild).channels.get(dimension.welcome.channel);
            var welcomeEmbed = await functions.embed.dimension.welcomeEmbed(newDimensionID, client, member);
            if(welcomeEmbed) {
                welcomeChannel.send(welcomeEmbed);
            }
        }

        // all other code you want to execute when someone joins a dimension
        var traveler = new Member(member.user.id);
        traveler.incrementVisits();
    },
    onDimensionLeave: async (client, oldDimensionID, member) => {

    }
}