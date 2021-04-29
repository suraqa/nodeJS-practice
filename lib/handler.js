// Dependencies
const helpers = require("./helper")
const _data = require("./data")

// Container for Requests Handlers
const handlers = {}

// Hello handler
handlers.hello = (data, callback) => {
    callback(200, { "message": "Hello world!" })
}

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = ["post", "get", "put", "delete"]
    if (acceptableMethods.indexOf(data.method) !== -1) {
        handlers._users[data.method](data, callback)
    } else {
        console.log("Method not allowed!")
    }
}

//Container for users submethods
handlers._users = {}

// Users - post
// Required data: fistName, lastName, phone, password, tosAgreement
//Opional: none
handlers._users.post = (data, callback) => {
    // Validating all data
    const firstName = typeof (data.payload.firstname) === "string" && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false
    const lastName = typeof (data.payload.lastname) === "string" && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false
    const phone = typeof (data.payload.phone) === "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false
    const password = typeof (data.payload.password) === "string" && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false
    const tosAgreement = typeof (data.payload.tosAgreement) === "boolean" ? data.payload.tosAgreement : false

    // Checkin if we have all the required fields
    if (firstName && lastName && phone && password && tosAgreement) {

        // Checking if the user doesnot already exists
        _data.read("users", phone, (error, data) => {
            if (error) {
                // Hashing the password
                const hashedPassword = helpers.hash(password)

                if (hashedPassword) {
                    // Create a user object
                    const userObj = {
                        "firstName": firstName,
                        "lastName": lastName,
                        "phone": phone,
                        "password": hashedPassword,
                        "tosAgreement": true
                    }

                    // Storing the user object
                    _data.create("users", phone, userObj, error => {
                        if (!error) {
                            callback(200, { "Message": "User created successfully!!" })
                        } else {
                            callback(500, { "Error": "Could not create the new user." })
                        }
                    })
                } else {
                    callback(500, { "Error": "Couldn't hash the user's password." })
                }
            } else {
                callback(400, { "Error": "User already exists" })
            }
        })





    } else {
        callback(400, { "Error": "Missing required fields." })
    }
}

// Users - get
handlers._users.get = (data, callback) => {

}

// Users - put
handlers._users.put = (data, callback) => {

}

// Users - delete
handlers._users.delete = (data, callback) => {

}




// Exporting the handlers conatiner
module.exports = handlers