module.exports.run = async (msg, client, args) => {
    if(!msg.member.hasPermission('ADMINISTRATOR')) {
        return msg.channel.send("You must be an Overlord™ to access dimension settings.");
    }
    
    switch(args[0]) {
        case "rules": 
            msg.channel.send({
                files: [{
                    attachment: 'assets/banners/rules.gif',
                    name: 'rules.gif'
                }]
            })
            break;
        case "roles":
            msg.channel.send({
                files: [{
                    attachment: 'assets/banners/roles.gif',
                    name: 'roles.gif'
                  }]
            })
            break;
        case "artists": 
            msg.channel.send({
                files: [{
                    attachment: 'assets/banners/artists.gif',
                    name: 'artists.gif'
                }]
            })
        break;
        case "staff": 
            msg.channel.send({
                files: [{
                    attachment: 'assets/banners/staff.gif',
                    name: 'staff.gif'
                }]
            })
        break;
        case "links": 
            msg.channel.send({
                files: [{
                    attachment: 'assets/banners/links.gif',
                    name: 'artists.gif'
                }]
            })
        break;
    }
}

module.exports.help = {
    name: "banner"
}