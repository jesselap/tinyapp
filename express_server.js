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

const urlDatabase = {};
const users = {};


// GETS
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// List of current URL (homepage)
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  console.log(templateVars.user_id)
  res.render("urls_index", templateVars);
});
// Create a new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
});
// Editing page for specific URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});
// app.get("/urls/:id/edit", (req, res) => {
//   const { id } = req.params;

//   for (let short in urlDatabase) {
//     if (urlDatabase[short].userID === id) {
//       const templateVars = {
//         urlId: id,
//         longURL: urlDatabase[short].longURL,
//         user_id: users[req.cookies["user_id"]],
//         shortURL: short
//       }
//       res.render("urls_show", templateVars);
//       return;
//     }
//   } 
// });
// Link to the URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL.includes("http")) {
    res.redirect(`${longURL}`);
  } else {
    res.send("Error: Cannot connect");
  }
});
// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});
// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});


//POSTS
app.post("/urls", (req, res) => {
  const newShort = generateRandomString()
  urlDatabase[newShort] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  console.log(urlDatabase)
  console.log("^^^^^^^^^")
  res.redirect(`/urls/${newShort}`);
});
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  if (urlDatabase[id].userID !== req.cookies["user_id"]) {
    res.status(403).redirect("/urls");
    return;
  }
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  if (urlDatabase[id].userID !== req.cookies["user_id"]) {
    res.status(403).redirect("/urls");
    return;
  }

  delete urlDatabase[id];

  res.redirect("/urls");
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
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Error: missing field");
    res.status(400).redirect("/register");
    return;
  }
  if (userExists(email, users)) {
    console.log("Error: user already exists");
    res.status(400).redirect("/register");
    return;
  }
  const newUser = createUser(email, password, users);
  console.log(newUser)
  res.cookie("user_id", newUser.newID);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




