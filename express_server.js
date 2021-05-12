const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const {
  generateRandomString,
  userExists,
  createUser,
  fetchUser
} = require("./helpers/helpers.js");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};





app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL
  res.redirect(`/urls/${newShort}`)
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL.includes("http")) {
    res.redirect(`${longURL}`);
  } else {
    res.send("Error: Cannot connect");
  }
});
app.get("/urls/:id/edit", (req, res) => {
  const { id } = req.params;

  const templateVars = { 
    urlId: id, 
    longURL: urlDatabase[id], 
    user_id: users[req.cookies["user_id"]],
  };

  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
})
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;

  delete urlDatabase[id];

  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user_id = fetchUser(users, email, password);
  if (!user_id) {
    res.status(403).redirect("/login");
    return;
  }
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars)
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Error: missing field");
    res.status(400).redirect("/register");
    return;
  };
  if (userExists(email, users)) {
    console.log("Error: user already exists");
    res.status(400).redirect("/register");
    return;
  }
  const newUser = createUser(email, password, users);
  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
