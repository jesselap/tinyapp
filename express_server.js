const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

function generateRandomString() {
  let randomString = [];
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let length = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString.push(characters.charAt(Math.floor(Math.random() * length)));
  }
  return randomString.join('');
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
    username: req.cookies["username"]
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
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
