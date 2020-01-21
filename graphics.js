const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require('discord.js');


module.exports = {
    profile: async (msg) => {
        const canvas = createCanvas(1017, 671);
        const ctx = canvas.getContext('2d');
        registerFont("./assets/fonts/SHPinscher-Regular.otf", { family: 'pin' });

        // background
        const cardImg = await loadImage('./assets/images/card.png');
        ctx.drawImage(cardImg, 0, 0, canvas.width, canvas.height);

        ctx.font = '60px "pin"';
        // Select the style that will be used to fill the text in
        ctx.fillStyle = '#ffffff';
        // Actually fill the text with a solid color
        ctx.fillText('test', canvas.width / 2.5, canvas.height / 1.8);


        // draw the circle clipout
        ctx.beginPath();
        ctx.arc((canvas.width*2/3)+147.5, 70+162.5+5, 162.5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // user avatar
        const userAvatar = await loadImage(msg.author.displayAvatarURL({format: 'jpg'}));
        ctx.drawImage(userAvatar, (canvas.width*2/3)-15, 70+5, 325, 325)

        const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
        return attachment;
    }
}

