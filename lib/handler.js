// Dependencies
const helpers = require("./helper")
const _data = require("./data")

// Container for Requests Handlers
const handlers = {}

// Hello handler
handlers.hello = (data, callback) => {

    callback(200, data)
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
    const firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    const lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    const phone = typeof (data.payload.phone) === "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false
    const password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
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
// Required: phone (through qs)
// Optional: none
handlers._users.get = (data, callback) => {
    // Checking if the phone number is valid
    const phone = typeof (data.queryString.phone) == "string" && data.queryString.phone.trim().length == 11 ? data.queryString.phone.trim() : false

    if (phone) {
        // Checking if the user exists
        _data.read("users", phone, (error, data) => {
            if (!error && data) {
                delete data.password
                callback(200, data)

            } else {
                callback(404, { "Error": "User not found." })
            }
        })
    } else {
        callback(400, { "Error": "Missing required field." })
    }
}

// Users - put
// Required: phone (thru payload)
// Optional: firstname, lastname, password (at least any one of them)
handlers._users.put = (data, callback) => {
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false

    if (phone) {
        const firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
        const lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
        const password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

        if(firstName || lastName || password) {
            _data.read("users", phone, (error, userObj) => {
                if(!error && userObj) {
                    if(firstName) {
                        userObj.firstName = firstName
                    }
                    if(lastName) {
                        userObj.lastName = lastName
                    }
                    if(password) {
                        userObj.password = helpers.hash(password)
                    }
                    _data.update("users", phone, userObj, error => {
                        if(!error) {
                            callback(200, {"Message":"Successfully updated user's obj."})
                        } else {
                            console.log(error)
                            callback(500, {"Error":"Couldnt update user's obj."})
                        }
                    })
                } else {
                    console.log(error)
                    callback(404, {"Error":"User not found"})
                }
            })
        } else {
            callback(400, {"Error":"Missing field(s) to update"})
        }


    } else {
        callback(400, { "Error": "Missing required field" })
    }

}

// Users - delete
// Required: phone
// Optional: none
handlers._users.delete = (data, callback) => {
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false
    if(phone) {
        // Checking if the user exists
        _data.read("users", phone, (error, userObj) => {
            if(!error && userObj) {
                _data.delete("users", phone, error => {
                    if(!error) {
                        callback(200, {"Error":"Successfully deleted the user"})
                    } else {
                        console.log(error)
                        callback(500, {"Error":"Couldnt delete user"})
                    }
                })
            } else {
                console.log(error)
                callback(404, {"Error": "User not found."})
            }
        })
    } else {
        callback(400, {"Error":"Missing required field."})
    }
}




// Exporting the handlers conatiner
module.exports = handlers