const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const AuthService = require('./services/auth');

const app = express();
const port = 3000;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const authService = new AuthService();

app.use(express.static(__dirname + '/pages'));

app.use(session({
  secret: 'peninsula',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
}));
// token will live 1 minute
//------------check-token---------------------
app.use(async (req, res, next) => {
  if (! authService.db) {
    await authService.connectDb();
  }

  if (! req.session.token) {
    next();
  } else {
    res.sendFile(__dirname + '/pages/user-ok.html');
  }
});
//----------------login--------------------
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/pages/login-form.html');
});

app.post('/login', urlencodedParser, async (req, res) => {
  if (! req.body) res.sendStatus(400);

  const uName = req.body.username;
  const password = req.body.password;
  const statusAuth = await authService.login(uName, password);

  if (statusAuth) {
    const token = await authService.getToken(uName);
    req.session.token = token;

    res.sendFile(__dirname + '/pages/user-ok.html');
  } else {
    res.sendFile(__dirname + '/pages/user-fail.html');
  }
});
//-------------signup--------------------
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/pages/signup-form.html');
});

app.post('/signup', urlencodedParser, async (req, res) => {
  if (! req.body) res.sendStatus(400);

  const uName = req.body.username;
  const password = req.body.password;
  const statusAuth = await authService.signup(uName, password);

  if (statusAuth === 1) {
    const token = await authService.getToken(uName);
    req.session.token = token;
    
    res.sendFile(__dirname + '/pages/user-created.html');
  } else {
    res.sendStatus(400);
  }
});
//---------------startpage-------------------
app.get('/', (req, res) => {
  res.send('<a href="/login">SignIn</a><br><a href="/signup">SignUp</a>');
});

app.listen(port, async () => {
  console.log('server started on port 3000');
});
