module.exports = {
    route: "/posts/:id",
    type: "get",
    code: (req, res, db) => {
        if(!db.posts.get(req.params.id)) return res.render('pages/error', { error: 'That post doesn\'t exist' })

        let post = db.posts.get(req.params.id)
        post.key = req.params.id,
        post.user = (req.session.user ? req.session.user : 'Guest')

        res.render('pages/post', posts)
    }
}