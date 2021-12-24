module.exports = {
    route: "/community/:id",
    type: "get",
    code: (req, res, db) => {
        if(!db.communities.get(req.params.id)) return res.render('pages/error', {error:'That community doesn\'t exist'})

        let community = db.communities.get(req.params.id)
        community.name = req.params.id

        res.render('pages/community', community)
    }
}