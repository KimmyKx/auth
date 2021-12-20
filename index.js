const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const http = require('http').createServer(app)
const { Database } = require('quickmongo')
const socketio = require('socket.io')
const io = socketio(http, {
    cors: { origin: "*"}
})
const db = new Database(process.env['mongo'])
const PORT = process.env.PORT || 3000;

// _REAL
let _user = {}

// Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "431330319013-7tkh8ltj18hke4c5rs3b74v5pphikc4t.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/assets"));

app.get("/login", (req, res) => {
  res.render("login");
});


// Backend app
db.on('ready', async () => {
  console.log('Database connected')
})

io.on('connection', async (socket) => {
  console.log('a user connected')
  const msg = await db.get('messages')
  if(!msg) await db.set('messages', [])

  socket.on('message', async (message) => {
    if(message.author.name != _user.name || message.author.id != _user.id || message.author.email != _user.email) {
      app.get('/', (req, res) => {
        res.redirect('/logout')
      })
      return
    }
    await db.push(`messages`, message)
    io.emit('message', message)
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
  res.render("index", { user: user, msgs: msgs });
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
   

    const isAvailable = await db.get(`user_${payload.email}`);
    if(!isAvailable){
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        user.id = generateID(15);
        user.createdAt = Date.now();
        user.lastLogged = Date.now();
        await db.set(`user_${user.email}`, user);
    } else {
        const userInfo = await db.get(`user_${payload.email}`)
        user.name = userInfo.name
        user.email = userInfo.email
        user.picture = userInfo.picture
        user.id = userInfo.id
        user.createdAt = userInfo.createdAt
        user.lastLogged = userInfo.lastLogged
    }
    
  }
  verify()
    .then(async () => {
      const msgs = await db.get('messages')
      req.user = user;
      req.msgs = msgs;
      next();
    })
    .catch((err) => {
      // console.log(err);
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
