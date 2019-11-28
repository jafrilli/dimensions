
//! SUPER IMPORTANT:
var memberModel = require("../models/member.js");

var response = {
    success: true,
    message: "",
}

module.exports = 

class Member {

    constructor(input) {
        if(typeof input == "object") {
            var keyArray = Object.keys(input);
            for(var i = 0; i < keyArray.length; i++) {
                this[keyArray[i]] = input[keyArray[i]];
                console.log(keyArray[i]);
            }
        }
        else if (typeof input == "string" && input.length > 15) {
            this["_id"] = input;
        }
        else {
            // return error response
        }
    }

    // use init if you need to refresh and get the member's properties 
    // it will get the doc from findOne() and generate class properties 
    // based on the json keys-value pairs.
    // I separated init from constructor so we can save on processing power
    async init(input) {
        var rsp = response;
        if(typeof input == "string" && input > 15) {
            this["_id"] = input;
        }
        if(this["_id"] != null && this["_id"].length > 15) {
            await memberModel.findOne({_id: this["_id"]}, async (err, doc) => {
                if(err) {
                    console.log("Could not find user with that id (classes/user.js)");
                    rsp.success = false;
                    rsp.message = "Member.init(): Could not find user with that id.",
                    rsp.error = err;
                }
                if(doc) {
                    var docKeys = Object.keys(doc["_doc"]);
                    for(var i = 0; i < docKeys.length; i++) {
                        this[docKeys[i]] = doc[docKeys[i]];
                    }
                }
            })
        }
    }

    // used for upsert to user processes.
    async upsertUser(newObject) {
        try {
            await memberModel.updateOne(
                {_id: this["_id"]},
                newObject,
                {upsert: true},
                async (err, doc) => {
                    if(err) {
                        // do something to catch the error
                        throw err;
                    }
                }
            );
        } catch (err) {
            console.log("upsertUser: Error: " + err);
        }
    }


    //* This is where you add functions:
    // changeExp - or +
    async changeExp(howMuch) {
        var rsp = response;
        if(isNaN(howMuch)) howMuch = 0;
        try {
            // it keeps on doubling the number, so i divided it by two to get it precise
            await this.upsertUser({ $inc: { exp: howMuch/2 } });
            rsp.message = "Successfully added " + howMuch + " exp to user!";
        } catch (err) {
            console.log("changeExp: Error: " + err)
            rsp.success = false;
            rsp.message = "There was an issue changing exp";
            rsp.error = err;
        }
        return rsp;
    }

    // changeMoney - or +
    async changeMoney(howMuch) {
        var rsp = response;
        if(isNaN(howMuch)) howMuch = 0;;
        try {
            // it keeps on doubling the number, so i divided it by two to get it precise
            await this.upsertUser({ $inc: { money: howMuch/2 } });
            rsp.message = "Successfully added " + howMuch + " currency to user!";
        } catch (err) {
            console.log("changeMoney: Error: " + err)
            rsp.success = false;
            rsp.message = "There was an issue changing money";
            rsp.error = err;
        }
        return rsp;
    }

    // incrementVisits +1 only
    async incrementVisits() {
        var rsp = response;
        try {
            // it keeps on doubling the number, so i divided it by two to get it precise
            await this.upsertUser({ $inc: { visits: 1/2 } });
            rsp.message = "Successfully incremented dimension visits!";
        } catch (err) {
            console.log("incrementVisits: Error: " + err)
            rsp.success = false;
            rsp.message = "There was an issue incrementing visits";
            rsp.error = err;
        }
        return rsp;
    }

    // buy item from shop
    async buy(itemID) {
        // make a shop system like dimensions, but manually. make it update from db.
        // this.changeMoney(-[price]);
        // this.upsertUser({ items: $add: { item } });
    }
}


/*
    return format
    {
        success: true, //required
        message: "Message" //optional
    }
*/