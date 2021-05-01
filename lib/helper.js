// Dependencies
const crypto = require("crypto")


// Container for helper function
const helpers = {}

// Hashing method
helpers.hash = str => {
    if(typeof(str) == "string" && str.length > 0) {
        return crypto.createHmac("sha256", "ThisIsAHashingSecret").update(str).digest("hex")
    } else {
        return false
    }
}

// Export the helper container
module.exports = helpers