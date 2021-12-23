const cookieParser = require("cookie-parser")
const express = require("express")
const app = express()
const http = require('http').createServer(app)
const socketio = require('socket.io')
const { formatRelative, subDays } = require('date-fns')
const io = socketio(http, {
    cors: { origin: "*"}
})
const PORT = process.env.PORT || 3000
let _user = {}

// DBMS MongoDB
// const { Collection } = require('quickmongo')

let ms

const { Database } = require('./Schema/utils')
const db = new Database()


// Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  process.env["CLIENT_ID"];
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/assets"));

app.get("/login", (req, res) => {
  res.render("login");
});


// Prototype
String.prototype.toCapitalize = function() {
  const up = this.charAt(0).toUpperCase()
  return up + this.slice(1)
}

async function funn(){
  await db.pull('ID', 'messages', { message: { id: "msgID"}})
  const msg = await db.find("ID", "messages")

  console.log(msg)
}

io.on('connection', async (socket) => {
  console.log('a user connected')

  const msg = await db.find('ID', 'messages')
  if(!msg) await db.insert({ID: "message", message: []})
  
  socket.on('message', async (message) => {
    message.createdAt = new Date
    if(!message.createdAt) return
    await db.push('ID', 'messages', { message: message })
    message._unreal = formatRelative(subDays(message.createdAt, 0), new Date()).toCapitalize()
    io.emit('message', message)
  })

  socket.on('messageDelete', async (messageID) => {
    if(!messageID) return
    //await db.pull('ID', 'messages', {message: { id: messageID}})
    io.emit('messageDelete', messageID)
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

app.get("/", checkAuthenticated, async (req, res) => {

  let user = req.user;
  _user.name = req.user.name;
  _user.email = req.user.email;
  _user.id = req.user.id;
  let msgs = req.msgs;
  if(msgs)
  msgs.message.forEach(time => time.createdAt = formatRelative(subDays(time.createdAt, 0), new Date()).toCapitalize())
  res.render("index", { user: user, msgs: msgs});
});

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
   
    const isAvailable = await db.find(`ID`, `${payload.email}`);
    if(!isAvailable){
        user.ID = payload.email;
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        user.userID = generateID(15);
        user.createdAt = new Date;
        user.lastLogged = new Date;
        await db.insert(user)
        console.log(`${user.name} has registered`)
    } else {
        const userInfo = await db.find(`ID`, payload.email)
        user.ID = userInfo.email;
        user.name = userInfo.name
        user.email = userInfo.email
        user.picture = userInfo.picture
        user.userID = userInfo.userID
        user.createdAt = userInfo.createdAt
        user.lastLogged = userInfo.lastLogged
        console.log(`${user.name} has logged in`)
    }
  }
  verify()
    .then(async () => {
      const msgs = await db.find('ID', 'messages')
      req.user = user;
      req.msgs = msgs;
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

module.exports = ms