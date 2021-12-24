module.exports = {
    route: "/api/post",
    type: "post",
    code: (req, res, db, io, xss) => {
        if (!req.body.user || !req.body.content) return res.send('no bye')
        
        switch(req.session.user) {
            case req.body.user:
                break;
            case 'Guest':
                break;
            default:
                return res.send('no bye')
                break;
        }

        db.posts.set("_" + db.posts.autonum, {
            poster: req.body.user,
            content: xss(req.body.content),
            time: new Date(),
            stamp: false,
            yeah: 0,
            replies: []
        })

        io.sockets.emit("post", {
            poster: req.body.user,
            content: xss(req.body.content)
        })
        
        res.json({ yass: "yass" })
    }
}