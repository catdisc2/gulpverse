module.exports = {
    route: "/community",
    type: "get",
    code: (req, res) => res.render('pages/communities', { comm: communities.array() })
}