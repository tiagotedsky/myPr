
require('dotenv').config();

const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const myDb = {
};

const gitHubConfig = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: '/return'
  // scope: ['r_emailaddress', 'r_basicprofile'], <---- We need to set this.
};

passport.use(new GitHubStrategy(gitHubConfig,
function(accessToken, refreshToken, profile, cb) {
  // In this example, the user's Facebook profile is supplied as the user
  // record.  In a production-quality application, the Facebook profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.

  const { id } = profile;

  // Find or create user on our DB
  myDb[id] = {
    ...profile,
  };

  return cb(null, profile);
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser((user, done) => {

  console.log('serializeUser ');

  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log('deserializeUser ', obj);

  done(null, obj);
});


// ==========================
// 
// 
//          EXPRESS 
// 
// 
// ==========================


// Create a new Express application.
const app = express();
const https = require('https');
const fs = require('fs');

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());


// ==========================
// 
// Define routes.
// 
// ==========================

// WEB ROUTES
app.get('/', (req, res) => {
  res.render('home', { user: req.user });
});

app.get('/login', (req, res)=> {
  res.render('login');
});

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(),
 (req, res)=> {
    res.render('profile', { user: req.user });
  });

app.get('/login/github', passport.authenticate('github'));


// WEB RETURN 
app.get('/return', 
  passport.authenticate('github', { 
    failureRedirect: '/login', 
    // successRedirect: '/redirect',  <--- deep link into app
  }),
 (req, res) => {
    res.redirect('/');
  });

// MOBILE APP RETURN
// router.get('/redirect', (req, res, next) => {
//   // you can see what you get back from LinkedIn here:
//   console.log(req.user.dataValues) 
//   res.redirect(<deep-link-to-react-native-app>)
//   })

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(process.env.PORT || 3002, () => {
  console.log(`Example app listening on port ${process.env.PORT}! Go to https://localhost:${process.env.PORT}/`)
})
