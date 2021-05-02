// Dependencies
const helpers = require("./helper")
const _data = require("./data")

// Container for Requests Handlers
const handlers = {}

// Hello handler
handlers.hello = (data, callback) => {

    callback(200, { "Message": "Hello World!" })
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
        callback(405, { "Error": "Method not allowed!!" })
    }
}

//Container for users submethods
handlers._users = {}

// Users - POST
// Required data: fistName, lastName, phone, password, tosAgreement
//Opional: none
handlers._users.post = (data, callback) => {
    // Validating all data
    const firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    const lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    const phone = typeof (data.payload.phone) === "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false
    const password = typeof (data.payload.password) === "string" && data.payload.password.length > 0 ? data.payload.password : false
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

// Users - GET
// Required: phone
// Optional: none
handlers._users.get = (data, callback) => {
    // Checking if the phone number is valid
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false

    if (phone) {

        const token = typeof (data.headers.token) == "string" ? data.headers.token : false

        if (token) {
            handlers._tokens.verify(token, phone, isValid => {
                if (isValid) {
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
                    callback(403, { "Error": "Invalid token" })
                }
            })
        } else {
            callback(400, { "Error": "Missing token" })
        }
    } else {
        callback(400, { "Error": "Missing required field." })
    }
}

// Users - PUT
// Required: phone (thru payload)
// Optional: firstname, lastname, password (at least any one of them)
handlers._users.put = (data, callback) => {
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false

    if (phone) {

        const token = typeof (data.headers.token) == "string" ? data.headers.token : false

        if (token) {
            handlers._tokens.verify(token, phone, isValid => {
                if (isValid) {
                    const firstName = typeof (data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
                    const lastName = typeof (data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
                    const password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

                    if (firstName || lastName || password) {
                        _data.read("users", phone, (error, userObj) => {
                            if (!error && userObj) {
                                if (firstName) {
                                    userObj.firstName = firstName
                                }
                                if (lastName) {
                                    userObj.lastName = lastName
                                }
                                if (password) {
                                    userObj.password = helpers.hash(password)
                                }
                                _data.update("users", phone, userObj, error => {
                                    if (!error) {
                                        callback(200, { "Message": "Successfully updated user's obj." })
                                    } else {
                                        console.log(error)
                                        callback(500, { "Error": "Couldnt update user's obj." })
                                    }
                                })
                            } else {
                                console.log(error)
                                callback(404, { "Error": "User not found" })
                            }
                        })
                    } else {
                        callback(400, { "Error": "Missing field(s) to update" })
                    }
                } else {
                    callback(403, { "Error": "Invalid token" })
                }
            })
        } else {
            callback(400, { "Error": "Missing token" })
        }
    } else {
        callback(400, { "Error": "Missing required field" })
    }

}

// Users - DELETE
// Required: phone
// Optional: none
handlers._users.delete = (data, callback) => {
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false
    if (phone) {
        const token = typeof (data.headers.token) == "string" ? data.headers.token : false
        if (token) {
            handlers._tokens.verify(token, phone, isValid => {
                if (isValid) {
                    // Checking if the user exists
                    _data.read("users", phone, (error, userObj) => {
                        if (!error && userObj) {
                            _data.delete("users", phone, error => {
                                if (!error) {
                                    callback(200, { "Error": "Successfully deleted the user" })
                                } else {
                                    console.log(error)
                                    callback(500, { "Error": "Couldnt delete user" })
                                }
                            })
                        } else {
                            console.log(error)
                            callback(404, { "Error": "User not found." })
                        }
                    })
                } else {
                    callback(403, { "Error": "Invalid token" })
                }
            })
        } else {
            callback(400, { "Error": "Missing token" })
        }
    } else {
        callback(400, { "Error": "Missing required field." })
    }
}

// Tokens handler
handlers.tokens = (data, callback) => {
    const acceptableMethods = ["get", "post", "put", "delete"]
    if (acceptableMethods.indexOf(data.method) != -1) {
        handlers._tokens[data.method](data, callback)
    } else {
        callback(405, { "Error": "Method not allowed!!" })
    }
}

// Container for tokens submethds
handlers._tokens = {}

// Tokens - POST
// Required: phone, password
// Optional: none
handlers._tokens.post = (data, callback) => {
    const phone = typeof (data.payload.phone) == "string" && data.payload.phone.trim().length == 11 ? data.payload.phone : false
    const password = typeof (data.payload.password) == "string" && data.payload.password.length > 0 ? data.payload.password : false

    if (phone && password) {
        _data.read("users", phone, (error, userObj) => {
            if (!error && userObj) {
                if (userObj.password == helpers.hash(password)) {
                    // if user is authenticated, generate a token obj with token id & store it
                    const tokenId = helpers.createRandomString(20)
                    const expiry = Date.now() + (1000 * 60 * 60)

                    const tokenObj = {
                        phone: phone,
                        id: tokenId,
                        expiry: expiry
                    }

                    _data.create("tokens", tokenId, tokenObj, error => {
                        if (!error) {
                            callback(200, tokenObj)
                        } else {
                            callback(500, { "Error": "Couldnt create a new token" })
                        }
                    })
                } else {
                    callback(400, { "Error": "Wrong password" })
                }
            } else {
                callback(404, { "Error": "User not found" })
            }
        })
    } else {
        callback(400, { "Error": "Missing required fields." })
    }
}

// Tokens - GET
// Required: tokenId
// Optional: none
handlers._tokens.get = (data, callback) => {
    const tokenId = typeof (data.payload.tokenId) == "string" && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : false
    if (tokenId) {
        _data.read("tokens", tokenId, (error, tokenObj) => {
            if (!error && tokenObj) {
                callback(200, tokenObj)
            } else {
                callback(404, { "Error": "Token not found" })
            }
        })
    } else {
        callback(400, { "Error": "Missing required field" })
    }
}

// Tokens - PUT
// Required: tokenId, extend
// Optional: none
handlers._tokens.put = (data, callback) => {
    const tokenId = typeof (data.payload.tokenId) == "string" && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : false
    const extend = typeof (data.payload.extend) == "boolean" ? data.payload.extend : false

    if (tokenId && extend) {
        // Check if token exists before updating it
        _data.read("tokens", tokenId, (error, tokenObj) => {
            if (!error && tokenObj) {
                // Check if token is still valid
                if (tokenObj.expiry > Date.now()) {
                    tokenObj.expiry = Date.now() + (1000 * 60 * 60)
                    _data.update("tokens", tokenId, tokenObj, error => {
                        if (!error) {
                            callback(200, { "Message": "Successfully extended the token" })
                        } else {
                            callback(500, { "Error": "Couldnt extend the token." })
                        }
                    })
                } else {
                    callback(400, { "Error": "Couldnt extend a expired token." })
                }
            } else {
                callback(404, { "Error": "Token not found" })
            }
        })
    } else {
        callback(400, { "Error": "Missing required fields" })
    }
}

// Tokens - DELETE
// Required: tokenId
// Optional: none
handlers._tokens.delete = (data, callback) => {
    const tokenId = typeof (data.payload.tokenId) == "string" && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : false
    if (tokenId) {
        _data.read("tokens", tokenId, (error, tokenObj) => {
            if (!error && tokenObj) {
                _data.delete("tokens", tokenId, error => {
                    if (!error) {
                        callback(200, { "Error": "Token deleted successfully." })
                    } else {
                        callback(500, { "Error": "Couldnt delete the token." })
                    }
                })
            } else {
                callback(404, { "Error": "Token not found" })
            }
        })
    } else {
        callback(400, { "Error": "Missing required field" })
    }
}

// Token verifier method
handlers._tokens.verify = (tokenId, phone, callback) => {
    _data.read("tokens", tokenId, (error, tokenObj) => {
        if (!error && tokenObj) {
            // Check if the token is still valid
            if (tokenObj.phone == phone && tokenObj.expiry > Date.now()) {
                callback(true)
            } else {
                console.log("Token is invalid")
                callback(false)
            }
        } else {
            console.log("Token not found")
            callback(false)
        }
    })
}


// Exporting the handlers conatiner
module.exports = handlers