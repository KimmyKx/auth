const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()
const http = require('http').createServer(app)
const socketio = require('socket.io')
const ms = require('pretty-ms')
const fileUpload = require('express-fileupload')
const { formatRelative, subDays } = require('date-fns')
const io = socketio(http, {
    cors: { origin: "*"}
})
const PORT = process.env.PORT || 3000
let _user = {}

// DBMS MongoDB
const { Database } = require('./lib/db')
const db = new Database()

// Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID = "844648213687-9nnb31mbhk9ce48i8nntj2dfdvvp8t7t.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/assets"));
app.use(fileUpload());
app.get("/login", (req, res) => {
  res.render("login");
});



// Prototype
String.prototype.toCapitalize = function() {
  const up = this.charAt(0).toUpperCase()
  return up + this.slice(1)
}

async function funn(){
  const msg = await db.find("group", ["NJVuVhTH4R","yBcKveyska"], true)
  db.find()
  console.log(msg)
}

io.on('connection', async (socket) => {
  console.log('a user connected')
  
  socket.on('message', async (messaged) => {
    const message = {
      content: messaged.content,
      id: generateID(15),
      timestamp: Date.now(),
      createdAt: new Date(),
      author: messaged.author
    }
    
    if(!message.createdAt) return
    await db.push('id', `${messaged.reciever}`, { messages: message })
    message._unreal = formatRelative(subDays(message.createdAt, 0), new Date()).toCapitalize()
    io.emit('message', message, messaged.reciever)
  })

  socket.on('messageDelete', async (messageID) => {
    if(!messageID) return
    await db.pull('ID', 'messages', {message: { id: messageID}})
    io.emit('messageDelete', messageID)
  })

  socket.on('newgroup', async gbInfo => {
    const obj = {
      ID: 'group',
      creator: {
        id: gbInfo.userid,
        username: gbInfo.username,
        email: gbInfo.email
      },
      timestamp: Date.now(),
      createdAt: new Date(),
      id: generateID(10),
      name: `${gbInfo.gbName}`,
      picture: '',
      messages: []
    }
    await db.push(`email`, `${gbInfo.email}`, { group: `${obj.id}` })
    await db.insert(obj)
    io.emit('newgroup', obj)
  })

  socket.on('joingroup', async (link, userid) => {
    const group = await db.find('id', link)
    await db.pushOne('userID', userid, { group: `${link}` })
    io.emit('joingroup', group, userid)
  })

  socket.on('userchange', async (changes) => {
    await db.update('userID', changes.userid, { name: changes.userChange, description: changes.bio })
  })
  
})



// Google oauth
// Data yg dikirm dari login menggunakan POST, kita tangkap juga dnegan app.post
app.post("/login", (req, res) => {
  // Tangkap token yg dikirim
  let token = req.body.token;
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
  }
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.send("success");
    })
    // .catch(console.error);
});

app.post("/dashboard", (req, res) => {
  if(req.files){
    const userid = req.body.userid
    const file = req.files.upload
    const validExt = ['png', 'jpg', 'jpeg']
    const rename = file.name.split('.')
    const extension = rename[rename.length - 1]

    if(file.size > 500000) return res.redirect('/dashboard')
    if(!validExt.includes(extension)) return res.redirect('/dashboard')

    const newName = generateID(15)
    const result = `${newName}.${extension}`
    file.name = result
    file.mv(`${__dirname}/assets/profile/${file.name}`, async err => {
      if(err) throw err
      const currentImg = await db.find('userID', userid)
      await db.update('userID', userid, {picture: `${file.name}`})
      if(!currentImg.picture.startsWith('http')){
        require('fs').unlink(__dirname + '/assets/profile/' + currentImg.picture, err => {
          if(err) throw err
        })
      }
      res.redirect('/dashboard')
    })

  }
  else if(req.body.id){
    const id = req.body.id
    db.find('id', id).then(result => {
      if(result.messages)
      result.messages.forEach(message => message.createdAt = formatRelative(subDays(message.createdAt, 0), new Date()).toCapitalize())

      res.send(result)
  })
  }
})

app.post("/viewprofile", (req, res) => {
  const id = req.body.id
  db.find('userID', id).then(info => {
    if(!info) res.send(false)
    const time = ms(Date.now() - info.timestamp).split(' ')
    time.splice(time.length - 1, 1)
    info.timestamp = time.join(' ')
    res.send(info)
  })
})

app.post("/privatemessage", (req, res) => {
  const userid = req.body.id
  const partner = req.body.partner
  db.find('privateMembers', [userid, partner], true).then(result => {
    if(!result){
      db.insert({
          ID: 'private',
          privateMembers: [userid, partner],
          messages: [],
          createdAt: new Date(),
          timestamp: Date.now(),
          id: generateID(12)
      }).then(() => {
        db.find('privateMembers', [userid, partner], true).then(finn => {
          finn.notInList = true
          res.send(finn)
        })
      })
    }
    else { 
      res.send(result)
    }
  })
})

app.get("/", checkAuthenticated, async (req, res) => {
  let user = req.user;
  let msgs = req.msgs;
  if(msgs)
  msgs.message.forEach(time => time.createdAt = formatRelative(subDays(time.createdAt, 0), new Date()).toCapitalize())
  res.render("index", { user: user, msgs: msgs});
});


app.get("/dashboard", checkAuthenticated, async (req, res) => {
  let user = req.user;
  const groups = []
  const promises = req.user.group.map(gb => {
    groups.push(gb)
    return db.find(`id`, `${gb}`)
  })
  const group = Promise.all(promises).then(result => {
    const pre = []
    for(let i = 0; i < result.length; i++){
      if(!result[i]) db.pull('userID', user.userID, { group: groups[i] })
      else pre.push(result[i])
    }
    return pre
  })
  // const privateMessage = await db.find('privateMembers', [user.id], true)
  // console.log(privateMessage)
  res.render('dashboard', { user: user, group: await group })
})

app.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});

app.get("/registrasi", (req, res) => {
  res.render("registrasi");
});


function checkAuthenticated(req, res, next) {
  let token = req.cookies["session-token"];

  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
   
    const userInfo = await db.find(`email`, payload.email);
    
    if(!userInfo){
        user.ID = 'user';
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        user.userID = generateID(15);
        user.createdAt = new Date;
        user.lastLogged = new Date;
        user.timestamp = Date.now();
        user.group = ["yBcKveyska"];
        user.description = ''
        await db.insert(user)
        console.log(`${user.name} has registered`)
    } else {
        
        user.ID = userInfo.ID
        user.name = userInfo.name
        user.email = userInfo.email
        user.picture = userInfo.picture
        user.userID = userInfo.userID
        user.createdAt = userInfo.createdAt
        user.lastLogged = userInfo.lastLogged
        user.timestamp = Date.now()
        user.group = userInfo.group
        user.description = userInfo.description
        console.log(`${user.name} has logged in`)
    }
  }
  verify()
    .then(async () => {
      const msgs = await db.find('ID', 'messages')
      req.user = user;
      req.msgs = msgs;
      _user.name = user.name;
      _user.email = user.email;
      _user.id = user.userID;
      _user.picture = user.picture;
      next();
    })
    .catch((err) => {
      res.redirect("/login");
    });
}


function generateID(length){
  let result = ''
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  for(let i = 0; i < length; i++){
    result += char.charAt(Math.floor(Math.random() * char.length))
  }
  return result
}

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
