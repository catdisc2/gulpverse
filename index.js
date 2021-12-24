const express = require('express')
const app = express()
const fs = require('fs')
const enmap = require('enmap')
const xss = require('xss')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const session = require('express-session')
const bcrypt = require('bcrypt')
const FileStore = require('session-file-store')(session)
const posts = new enmap({
  name: "posts",
  fetchAll: true
})
const accounts = new enmap({
  name: "accounts",
  fetchAll: true
})
const communities = new enmap({
  name: "community",
  fetchAll: true
})

app.set('trust proxy', 1)
app.use(session({
  store: new FileStore({
    path: "./.data/sessions"
  }),
  secret: require('./.data/config.json').session.secret || 'JustDance2021',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const load = () => {
  if(!require('./.data/config.json')) {
    console.log('There is no config, so I\'ll create one for you.')

    fs.writeFileSync('./.data/config.json', JSON.stringify({
      port: 3000,
      session: {
          secret: 'JustDance2021'
      }
    }))
    console.log('Config file created')
  }

  fs.readdirSync('./routes/api').forEach(file => {
    let thang = require(`./routes/api/${file}`)
    let db = {
      posts: posts,
      accounts: accounts,
      communities: communities
    }
    app[thang.type](thang.route, (req, res) => thang.code(req, res, db, io))
    console.log(`Loaded route from ${file}`)
  })

  fs.readdirSync('./routes/web').forEach(file => {
    let thang = require(`./routes/web/${file}`)
    let db = {
      posts: posts,
      accounts: accounts,
      communities: communities
    }
    app[thang.type](thang.route, (req, res) => thang.code(req, res, db, io))
    console.log(`Loaded route from ${file}`)
  })
  
  console.log('Routes loaded')

  http.listen(require('./.data/config.json').port || 3000)

  console.log('Server started')
}

load()

app.post('/api/login', (req, res) => {
  if (!req.session.user || !req.session.pass) {
    if (!req.body.user || !req.body.pass) {
      res.send("go away")
    } else {
      let test = accounts.get(req.body.user)
      if (!test) {
        res.render("pages/error", { error: "That account doesn't exist!" })
      } else {
        if (bcrypt.compare(req.body.pass, test.password)) {
          req.session.user = req.body.user
          req.session.pass = req.body.pass
          res.redirect("/account")
        } else {
          res.render("pages/error", { error: "Wrong username or password" })
        }
      }
    }
  } else {
    res.render("pages/error", { error: "Your already logged in!" })
  }
})
app.post('/api/register', (req, res) => {
  if (req.session.user || req.session.pass) {
    res.render("pages/error", { error: "Your already logged in!" })
  } else {
    if (!req.body.user || !req.body.pass) {
      res.send("go away")
    } else {
      if (accounts.get(req.body.user)) {
        res.render("pages/error", { error: "That username already exists" })
      } else {
        if (!req.body.user.match(/^[0-9a-zA-Z]+$/) || !req.body.user.length == 12) {
          res.render("pages/error", { error: "Only numbers and letters for usernames! (and 12 chars)" })
        } else {
          accounts.set(req.body.user, {
            password: bcrypt.hash(req.body.pass, 10),
            date: new Date(),
            country: "Gulplands",
            comment: "No comment",
            yeahs: 0,
            birthday: {
              month: 0,
              day: 0
            },
            friends: [],
            following: [],
            followers: [],
            posts: []
          })
          req.session.user = req.body.user
          req.session.pass = req.body.pass
          res.redirect("/account")
        }
      }
    }
  }
})
app.post('/api/community/create', (req, res) => {
  if (req.body.name && req.body.icon) {
    if (communities.get(req.body.name)) {
      res.render('pages/error', { error: "A community with that name already exists!" })
    } else {

    }
  }
})
app.post('/api/posts/:id/post', (req, res) => {
  if (req.body.user && req.body.content && posts.get(req.params.id)) {
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
    res.json({ yass: "yass" })
  } else {
    res.send('no bye')
  }
})
app.post("/api/yeah", (req, res) => {
  if (req.body.user && req.body.id) {
    posts.update(req.body.id, { yeah: posts.get(req.body.id).yeah + 1 })
    io.sockets.emit("yeah", {
      newz: posts.get(req.body.id).yeah + 1,
      id: req.body.id
    })
    res.json({ yass: "yass" })
  } else {
    res.send("no bye")
  }
})