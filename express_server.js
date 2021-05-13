// Requirements
const express = require("express");
const methodOverride = require("method-override");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Helpers
const {
  generateRandomString,
  fetchUserByEmail,
  createUser,
  authenticateUser
} = require("./helpers/helpers.js");

// Middleware
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'))

// Database
const urlDatabase = {};
const users = {};

// GETS

// List of current URLs (homepage)
app.get("/", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(403).send("<html><body><h1>Please login or register</h1></body></html>");
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Create a new URL page
app.get("/urls/new", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    userId: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// Editing page for specific URL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send("<html><body><h1>Error: Short URL does not exist</h1></body></html>");
    return;
  }
  if (!users[req.session["user_id"]]) {
    res.status(403).send("<html><body><h1>Please login or register</h1></body></html>");
    return;
  }
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("<html><body><h1>You do not own this short URL</h1></body></html>");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// Link to the URL website
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send("<html><body><h1>Error: Short URL does not exist</h1></body></html>");
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL.includes("http")) {
    res.redirect(`${longURL}`);
  } else {
    res.status(403).send("<html><body><h1>Error: Cannot connect</h1></body></html>");
    return;
  }
});

// Login page
app.get("/login", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  // Remove this line
  const templateVars = {
    userId: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
});

//POSTS

// Create a new URL
app.post("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(403).send("<html><body><h1>Please login or register</h1></body></html>");
    return;
  }
  const newShort = generateRandomString();
  urlDatabase[newShort] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${newShort}`);
});

// Edit an existing URL
app.post("/urls/:id", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(403).send("<html><body><h1>Please login or register</h1></body></html>");
    return;
  }
  const { id } = req.params;
  const { longURL } = req.body;
  if (urlDatabase[id].userID !== req.session["user_id"]) {
    res.status(403).send("<html><body><h1>You do not own this short URL</h1></body></html>");
    return;
  }
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Delete an existing URL
app.delete("/urls/:id", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(403).send("<html><body><h1>Please login or register</h1></body></html>");
    return;
  }
  const { id } = req.params;
  if (urlDatabase[id].userID !== req.session["user_id"]) {
    res.status(403).send("<html><body><h1>You do not own this short URL</h1></body></html>");
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login request
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = authenticateUser(users, email, password);
  if (!userId) {
    res.status(403).send("<html><body><h1>Email and password do not match</h1></body></html>");
    return;
  }
  req.session["user_id"] = userId;
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  if (!email || !hashedPassword) {
    res.status(403).send("<html><body><h1>Please fill both fields.</h1></body></html>");
    return;
  }
  if (fetchUserByEmail(email, users)) {
    res.status(403).send("<html><body><h1>That user already exists.</h1></body></html>");
    return;
  }
  const newUser = createUser(email, hashedPassword, users);
  req.session["user_id"] = newUser.newID;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});