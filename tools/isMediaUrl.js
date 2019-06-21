const isURL = require("is-url");

module.exports = async (string) => {
    if(await !isURL(string)) return false;
    if(!string.endsWith(".gif") && 
        !string.endsWith(".jpg") && 
        !string.endsWith(".png") && 
        !string.endsWith(".jpeg") && 
        !string.endsWith(".gif/") && 
        !string.endsWith(".jpg/") && 
        !string.endsWith(".png/") && 
        !string.endsWith(".jpeg/")
    ) {
        return false;
    }
    return true;
}

