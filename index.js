// Dependencies
const http = require("http")
const { URL } = require("url")
const handlers = require("./lib/handler")
const data = require("./lib/data")
const StringDecoder = require("string_decoder").StringDecoder


http.createServer((request, response) => {
    const parsedUrl = new URL(request.url, "http://localhost:3000");
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')

    //Creating a qs obj
    const queryString = {}
    parsedUrl.searchParams.forEach((value, name) => {
        queryString[name] = value
    })



    // Creating a string decoder
    const decoder = new StringDecoder("utf-8")
    let buffer = ""

    request.on("data", chunk => {
        buffer += decoder.write(chunk)
    })

    request.on("end", () => {
        buffer += decoder.end()

        const chosenHandler = typeof (router[path]) !== "undefined" ? router[path] : handlers.notFound

        // Data obj to send alongwith the callback
        const data = {
            "path": path,
            "method": request.method.toLowerCase(),
            "queryString": queryString,
            "headers": request.headers,
            "payload": typeof(buffer) === "string" && buffer.length > 0 ? JSON.parse(buffer) : {}
        }

        chosenHandler(data, (statusCode, payLoad) => {
            const statuscode = typeof (statusCode) === "number" ? statusCode : 404
            let payload = typeof (payLoad) === "object" ? payLoad : {}

            payload = JSON.stringify(payload)
            response.setHeader("Content-Type", "application/json")
            response.writeHead(statuscode)
            response.end(JSON.stringify(payLoad))
        })
    })

}).listen(3000, () => {
    console.log("Server is now listening on port 3000.")
})

// Requests router
const router = {
    "hello": handlers.hello,
    "users": handlers.users
}