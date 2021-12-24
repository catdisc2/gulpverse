module.exports = {
    route: "/register",
    type: "get",
    code: (req, res) => res.render('pages/register', { login: (req.session.user && req.session.pass) })
}