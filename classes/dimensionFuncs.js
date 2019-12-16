const functions = require("../functions.js");

// added refresh portals to all
module.exports = {
    dimensionDelete: async (client, dimensionID, failureCB, successCB) => {
        await functions.db.delete.one(
            client,
            client.models.dimension, 
            {_id: dimensionID}, 
            (err) => {failureCB(err)},
            (doc) => {successCB(doc)}
        );
        functions.processes.refreshPortals(client);
    },
    dimensionCreate: async (client, newDimensionObject, failureCB, successCB) => {
        await functions.db.add(
            client,
            client.models.dimension, 
            newDimensionObject, 
            (err) => {failureCB(err)},
            (doc) => {successCB(doc)}
        );
        functions.processes.refreshPortals(client);
    },
    dimensionUpdate: async (client, dimensionID, field, newValue, failureCB, successCB, addToSet, removeFromSet) => {
        if(addToSet) {
            // console.log("Reached added to set");
            var newValues = newValue;
            if (!Array.isArray(newValue)) {
                newValues = [newValue];
            }
            await functions.db.update.one(
                client, 
                client.models.dimension,
                {"_id": dimensionID},
                {"$addToSet": {[field]: {"$each": newValues}}},
                async (err) => {await failureCB(err)},
                async (doc) => {await successCB(doc)}
            )
            return;
        } 
        else if(removeFromSet) {
            // console.log("Reached remove from set");
            var newValues = newValue;
            if (!Array.isArray(newValue)) {
                newValues = [newValue];
            }
            await functions.db.update.one(
                client, 
                client.models.dimension,
                {"_id": dimensionID},
                {"$pull": {[field]: {"$in": newValues}}},
                async (err) => {await failureCB(err)},
                async (doc) => {await successCB(doc)}
            )
            return;
        }
        else {
            // console.log("nothing else");
            await functions.db.update.one(
                client,
                client.models.dimension, 
                {_id: dimensionID}, 
                {[field]: newValue},
                async (err) => {await failureCB(err)},
                async (doc) => {await successCB(doc)}
            );
        }
        functions.processes.refreshPortals(client);
    },
};