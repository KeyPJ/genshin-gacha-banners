const got = require('got')

module.exports = async (req, res) => {
    try {
        const {i} = req.query

        let target = "https://genshin-wishes.com/content" + i
        // let target = "https://genshin-wishes.com/content/uploads/Venti_57d1a30e74.png"
        
        const imageRequest = got(target)

        // Use the `got` promises to:
        //   1. receive the content type via `imageResponse`
        //   2. receive the buffer via `imageBuffer`
        const [imageResponse, imageBuffer] = await Promise.all([
            imageRequest,
            imageRequest.buffer(),
        ])

        // Define a caching header to cache the image on the edge
        // FYI: Caching is tricky, and for now, I went with 12h caching time
        // There might be better configurations, but it does the trick for now
        //
        // Read more: https://vercel.com/docs/concepts/functions/edge-caching
        res.setHeader('Cache-Control', 's-maxage=86400')
        res.setHeader('content-type', imageResponse.headers['content-type'])
        res.setHeader('aaa', req.url)
        res.send(imageBuffer)
    } catch (error) {
        // Handle thrown 404s
        if (error.message.includes('404')) {
            res.status(404)
            return res.send('Not found')
        }

        // Fail hard if it's not a 404
        res.status(500)
        res.send(error.message)
    }
}
