const { createCanvas, loadImage } = require('canvas')

module.exports.graphics = {
    dimension: async (name, description, role, locked, roles, color, thumbnailURL, graphicsURL) => {
        const canvas = createCanvas(200, 200)
        const ctx = canvas.getContext('2d')
        
        // // Write "Awesome!"
        // ctx.font = '30px Impact'
        // ctx.rotate(0.1)
        // ctx.fillText('Awesome!', 50, 100)
        
        // // Draw line under text
        // var text = ctx.measureText('Awesome!')
        // ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        // ctx.beginPath()
        // ctx.lineTo(50, 102)
        // ctx.lineTo(50 + text.width, 102)
        // ctx.stroke()
        
        // Draw cat with lime helmet
        loadImage('https://skynetgaming.net/uploads/steamprofile_avatars/76561198154665691.jpg').then((image) => {
            ctx.drawImage(image, 50, 0, 70, 70)
        })

        // buffer of a png
        try {
            var buffer = await canvas.toBuffer();
        } catch (error) {
            
        }

        return buffer;
    }
}

