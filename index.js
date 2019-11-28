require("dotenv").config();

const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Memory = require("lowdb/adapters/Memory");
const db = low(
  process.env.NODE_ENV === "dev" ? new Memory() : new FileSync("db.json")
);

// Set some defaults (required if your JSON file is empty)
db.defaults({ users: {} }).write();

const gitHubConfig = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "/return"
  // scope: ['r_emailaddress', 'r_basicprofile'], <---- We need to set this.
};

passport.use(
  new GitHubStrategy(gitHubConfig, function(
    accessToken,
    refreshToken,
    profile,
    cb
  ) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.

    const { id } = profile;
    
    db.set(`users[${id}]`, {...profile, accessToken }).write()
    
    return cb(null, profile);
  })
);

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
  console.log("serializeUser ");

  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log("deserializeUser ", obj);

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
const https = require("https");
const fs = require("fs");

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
app.use(require("body-parser").urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// ==========================
//
// Define routes.
//
// ==========================

// WEB ROUTES
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    res.render("profile", { user: req.user });
  }
);

app.get("/login/github", 
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      return next(err);
    }
  }),
  async (req, res, next) => {
    // The request will be redirected to Github for authentication, so this
    // function will not be called.
    console.log("auth/gitHub", req);
    res.redirect("/");
    next();
  }
);

// WEB RETURN
app.get(
  "/return",
  passport.authenticate("github", {
    failureRedirect: "/login"
  }),
  async (req, res) => {

    
    res.render("home", { user: req.user });
  }
);

// TEST ENDPOINTS

app.get("/getUserInfo/:id", (req, res) => {  
  const userInfo = db.get(`users[${req.params.id}]`).write();

  const { 
    accessToken, 
    email,
    _json,
    _raw,
    ...userData
  } = userInfo;

  console.log('userInfo ', userInfo);

  res.json(userData);
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(process.env.PORT || 80, () => {
    console.log(
      `Example app listening on port ${process.env.PORT}! Go to https://localhost:${process.env.PORT}/`
    );
  });

app.listen("3004", () => console.log(`Example app listening on port 3004!`));
