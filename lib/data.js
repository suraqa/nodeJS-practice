// Dependencies
const fs = require("fs")
const path = require("path")

// Container for CRUD methods
const lib = {}

// Path of data directory
lib.baseDir = path.join(__dirname, "../.data")

// Write data to file
lib.create = (dir, file, data, callback) => {
    const path = `${lib.baseDir}/${dir}/${file}.json`
    fs.open(path, "wx", (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            const strData = JSON.stringify(data)
            fs.writeFile(fileDescriptor, strData, error => {
                if (!error) {
                    fs.close(fileDescriptor, error => {
                        if (!error) {
                            callback(false)
                        } else {
                            callback("Error closing new file.")
                        }
                    })
                } else {
                    callback("Error writing to new file")
                }
            })
        } else {
            callback("Error creating a new file. It may already exists.")
        }
    })
}

// Read data from file
lib.read = (dir, file, callback) => {
    const path = `${lib.baseDir}/${dir}/${file}.json`
    fs.readFile(path, "utf-8", (error, data) => {
        if (!error && data) {
            callback(error, JSON.parse(data))
        } else {
            callback(error)
        }
    })
}

// Update file
lib.update = (dir, file, data, callback) => {
    const path = `${lib.baseDir}/${dir}/${file}.json`
    fs.open(path, "r+", (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            const strData = JSON.stringify(data)
            fs.ftruncate(fileDescriptor, error => {
                if (!error) {
                    fs.writeFile(fileDescriptor, strData, error => {
                        if (!error) {
                            fs.close(fileDescriptor, error => {
                                if (!error) {
                                    callback(false)
                                } else {
                                    callback(error)
                                }
                            })
                        } else {
                            callback(error)
                        }
                    })
                } else {
                    callback(error)
                }
            })
        } else {
            callback(error)
        }
    })
}

// Delete the file
lib.delete = (dir, file, callback) => {
    const path = `${lib.baseDir}/${dir}/${file}.json`
    fs.unlink(path, error => {
        if (!error) {
            callback(false)
        } else {
            callback(error)
        }
    })
}

// Exporting the container
module.exports = lib