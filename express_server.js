const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Middleware
app.set("view engine", "ejs");
app.use(cookieSession ({
  name: "session",
  keys: ["key1", "key2"]
}));
app.use(bodyParser.urlencoded({extended: true}));

// Helpers
const {
  generateRandomString,
  userExists,
  createUser,
  fetchUser
} = require("./helpers/helpers.js");

// Database
const urlDatabase = {};
const users = {};


// GETS
// List of current URL (homepage)
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session["user_id"]]
  };
  console.log(templateVars.userId)
  res.render("urls_index", templateVars);
});

// Create a new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: users[req.session["user_id"]],
  };
  if (!users[req.session["user_id"]]) {
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
    userId: users[req.session["user_id"]],
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
//         user_id: users[req.session["user_id"]],
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
    userId: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
});


//POSTS
// Create a new URL
app.post("/urls", (req, res) => {
  const newShort = generateRandomString()
  urlDatabase[newShort] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${newShort}`);
});

// Edit an existing URL
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  if (urlDatabase[id].userID !== req.session["user_id"]) {
    res.status(403).redirect("/urls");
    return;
  }
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});

// Delete an existing URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  if (urlDatabase[id].userID !== req.session["user_id"]) {
    res.status(403).redirect("/urls");
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login request
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = fetchUser(users, email, password);
  if (!userId) {
    res.status(403).redirect("/login");
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
  if (userExists(email, users)) {
    res.status(403).send("<html><body><h1>That user already exists.</h1></body></html>");
    return;
  }
  const newUser = createUser(email, hashedPassword, users);
  req.session["user_id"] = newUser.newID;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




