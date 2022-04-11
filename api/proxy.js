const request = require('request')

module.exports = (req, res) => {
    // proxy middleware options
    let prefix = "/api"
    if (!req.url.startsWith(prefix)) {
        return
    }
    let target = "https://genshin-wishes.com/api" + req.url.substring(prefix.length)

    var options = {
        'method': 'GET',
        'url': target
    }
    request(options, function (error, response) {
        if (error) throw new Error(error)
        res.writeHead(200, {"Content-Type": "application/json"})
        res.write(response.body)
        res.end()
    })
}
