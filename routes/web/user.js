module.exports = {
    route: "/users/:id",
    type: "get",
    code: (req, res, db) => {
        if(!db.accounts.get(req.params.id)) return res.render('pages/error', { error: 'That user doesn\'t exist' })

        let account = db.accounts.get(req.session.user)
        account.username = req.params.id,
        account.own = (req.session.user === req.params.id)

        res.render('pages/account', account)
    }
}