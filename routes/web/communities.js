module.exports = {
    route: "/community",
    type: "get",
    code: (req, res, db) => res.render('pages/communities', { comm: db.communities.array() })
}