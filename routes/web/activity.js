module.exports = {
    route: "/activity",
    type: "get",
    code: (req, res) => res.render('pages/activity', {
        posts: posts.fetchEverything(),
        user: (req.session.use ? req.session.user : 'Guest')
    })
}