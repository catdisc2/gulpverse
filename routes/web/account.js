module.exports = {
    route: "/account",
    type: "get",
    code: (req, res, db) => {
        if(!req.session.user || !req.session.pass) return res.render('pages/account')

        let account = db.accounts.get(req.session.user)
        account.username = req.session.user,
        account.own = true

        res.render('pages/account', account)
    }
}