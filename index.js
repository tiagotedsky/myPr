require("dotenv").config();

const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Memory = require("lowdb/adapters/Memory");
const db = low(
  process.env.NODE_ENV === "dev"
    ? new Memory()
    : new FileSync("./db/users.json")
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

    db.set(`users[${id}]`, { ...profile, accessToken }).write();

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
const request = require("request");

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(express.json());

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

app.get(
  "/login/github",
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

app.get("/getUserInfo/:id", (req, res) => {
  console.log(`/getUserInfo/${req.params.id}`);

  const userInfo = db.get(`users[${req.params.id}]`).write();

  const { accessToken, email, _json, _raw, ...userData } = userInfo;

  res.json(userData);
});

app.get("/listUserRepos/:id", (req, res) => {
  console.log(`/listUserRepos/${req.params.id}`);
  const userInfo = db.get(`users[${req.params.id}]`).write();
  const { accessToken } = userInfo;

  const options = {
    url: "https://api.github.com/user/repos",
    headers: {
      "User-Agent": "request",
      Authorization: `token ${accessToken}`
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      console.error("error ", error);
    }

    const repositoryData = JSON.parse(body).map(repository => {
      return {
        id: repository.id,
        name: repository.name,
        owner: repository.owner.login
      };
    });

    res.json(repositoryData);
  });
});

const requestListPullRequests =  (accessToken, repoOwner, repoName, callBack) => {
  console.log('requestListPullRequests ');
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
    headers: {
      "User-Agent": "request",
      Authorization: `token ${accessToken}`
    }
  };

  return request(options, callBack);
};

app.get("/listPullRequests/:id", async (req, res) => {
  console.log(`/listPullRequests/${req.params.id}`);
  const userInfo = db.get(`users[${req.params.id}]`).write();
  const {
    accessToken,
    selectedRepository: { repoOwner, repoName }
  } = userInfo;


  await requestListPullRequests(
    accessToken,
    repoOwner,
    repoName,
    (error, response, body) => {
      if (error) {
        console.error("error ", error);
      }
      res.json(body);
    }
  );
});

app.post("/saveUserRepo", async (req, res) => {
  console.log("/saveUserRepo");
  const { repoOwner, repoId, repoName, userId } = req.body;
  const { accessToken } = db.get(`users[${userId}]`).write();
  
  
  db.set(`users[${userId}].selectedRepository`, {
    repoOwner,
    repoId,
    repoName,
  }).write();

  await requestListPullRequests(
    accessToken,
    repoOwner,
    repoName,
    (error, response, body) => {
      if (error) {
        console.error("error ", error);
      }

      console.log('body ', JSON.parse(body));
      res.json(JSON.parse(body));
    }
  );
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
