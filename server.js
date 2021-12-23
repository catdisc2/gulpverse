const express = require('express');
const app = express()
const enmap = require('enmap');
const posts = new enmap({
  name: "posts",
  fetchAll: true
})
const accounts = new enmap({
  name: "accounts",
  fetchAll:true
})
const communities = new enmap({
  name: "community",
  fetchAll:true
})
const xss = require('xss')
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const session = require("express-session")
const bcrypt = require("bcrypt")
const FileStore = require('session-file-store')(session)
app.set('trust proxy', 1)
app.use(session({
  store: new FileStore({
    path: "./.data/sessions"
  }),
  secret: process.env.lol,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.set('view engine', 'ejs')
app.use(express.json())
/**
for (let elem of posts.fetchEverything().entries()) {
    if(elem[1].content.includes("Raided by") || elem[1].content.includes("world is mine")) posts.delete(elem[0])
}
**/
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('pages/index');
})
app.get('/activity', (req, res) => {
  let yser;
  if(req.session.user) { yser = req.session.user } else { yser = "Guest" }
  res.render('pages/activity',{ posts: posts.fetchEverything(), user: yser })
})
app.get('/posts/:id', (req, res) => {
  if(!posts.get(req.params.id)) {
    res.render('pages/error', {error:"That post doesn't exist!"})
  } else {
    let lol = posts.get(req.params.id)
    lol.key = req.params.id
    if(req.session.user) { lol.user = req.session.user } else { lol.user = "Guest" }
    res.render('pages/post', lol)
  }
})
app.get('/community', (req, res) => {
  res.render('pages/communities',{ comm: communities.array()})
})
app.get('/community/:id', (req, res) => {
  if(communities.get(req.params.id)) {
    let zz = communities.get(req.oarans.id)
    zz.name = req.params.id
    res.render('pages/cact', zz)
  }
})
app.get('/account', (req, res) => {
  let details;
  if(req.session.user && req.session.pass) {
    details = accounts.get(req.session.user)
    details.username = req.session.user
    details.own = true
  }
  res.render('pages/account', details)
})
app.get('/register', (req, res) => {
  let details;
  if(req.session.user && req.session.pass) {
    details = {
      login:true
    }
  } else {
    details = {
      login:false
    }
  }
  res.render('pages/register', details)
})
app.get('/users/:user', (req, res) => {
  if(!accounts.get(req.params.user)) {
    res.render('pages/error', {error:"That user doesn't exist!"})
  } else {
    const user = accounts.get(req.params.user)
    user.username = req.params.user
    if(req.params.user !== req.session.user) user.own = false
    res.render('pages/account', user)
  }
})
app.post('/api/login', (req, res) => {
  if(!req.session.user || !req.session.pass) {
    if(!req.body.user || !req.body.pass) {
      res.send("go away")
    } else {
      let test = accounts.get(req.body.user)
      if(!test) {
        res.render("pages/error", {error:"That account doesn't exist!"})
      } else {
        if(bcrypt.compare(req.body.pass,test.password)) {
          req.session.user = req.body.user
          req.session.pass = req.body.pass
          res.redirect("/account")
        } else {
          res.render("pages/error", {error:"Wrong username or password"})
        }
      }
    }
  } else {
    res.render("pages/error", {error:"Your already logged in!"})
  }
})
app.post('/api/register', (req, res) => {
  if(req.session.user || req.session.pass) {
    res.render("pages/error", {error:"Your already logged in!"})
  } else {
    if(!req.body.user || !req.body.pass) {
      res.send("go away")
    } else {
      if(accounts.get(req.body.user)) {
        res.render("pages/error", {error:"That username already exists"})
      } else {
        if(!req.body.user.match(/^[0-9a-zA-Z]+$/)) {
          res.render("pages/error", {error:"Only numbers and letts for usernames!"})
        } else {
          accounts.set(req.body.user, {
            password: bcrypt.hash(req.body.pass, 10),
            date: new Date(),
            country: "Gulplands",
            comment: "No comment",
            yeahs: 0,
            birthday: {
              month:0,
              day:0
            },
            friends:[],
            following:[],
            followers:[],
            posts:[]
          })
          req.session.user = req.body.user
          req.session.pass = req.body.pass
          res.redirect("/account")
        }
      }
    }
  }
})
app.post('/api/post', (req, res) => {
  if(req.body.user && req.body.content) {
      posts.set("_" + posts.autonum, {
        poster: req.body.user,
        content: xss(req.body.content),
        time: new Date(),
        stamp: false,
        yeah: 0,
        replies: []
      });
      io.sockets.emit("post", {
        poster:req.body.user,
        content:xss(req.body.content)
      })
      res.json({yass:"yass"})
  } else {
    res.send('no bye')
  }
})
app.post('/api/community/create', (req, res) => {
  if(req.body.name && req.body.icon) {
    if(communities.get(req.body.name)) {
      res.render('pagse/error', {error:"A community with that name already exists!"})
    } else {
           
    }
  }
})
app.post('/api/posts/:id/post', (req, res) => {
  if(req.body.user && req.body.content && posts.get(req.params.id)) {
      let postz = posts.get(req.params.id).replies
      postz.push({
        id: "_" + posts.autonum,
        poster: req.body.user,
        content: xss(req.body.content),
        time: new Date(),
        stamp: false,
        yeah: 0
      })
      posts.update(req.params.id, { replies: postz })
      res.json({yass:"yass"})
  } else {
    res.send('no bye')
  }
})
app.post("/api/yeah", (req, res) => {
  if(req.body.user && req.body.id) {
    posts.update(req.body.id, { yeah: posts.get(req.body.id).yeah + 1 })
    io.sockets.emit("yeah", {
      newz: posts.get(req.body.id).yeah + 1,
      id: req.body.id
    })
    res.json({yass:"yass"})
  } else {
    res.send("no bye")
  }
})

io.on("connection", (socket) => {
})

http.listen(process.env.PORT || 3000)
console.log('Server Started!')