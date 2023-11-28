const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser")

app.set("view engine", "ejs");


// Sets a base object for the database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

// Set a base object for users
const users = {
  userRandomID: { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" },
  user2RandomID: { id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk" }
};

const getUserByEmail = function (email) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

// Function that generates random strings
const random = function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//-----------------POSTS-------------------------


// Generates a random string for the id, updates the database with the id - longURL key value pair
app.post("/urls", (req, res) => {
  const ran = random();
  urlDatabase[`${ran}`] = req.body.longURL;
  res.redirect(`/urls/${ran}`);
});

// For deleting urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[`${req.params.id}`];
  res.redirect("/urls");
})

// For editing urls
app.post("/urls/:id", (req, res) => {
  urlDatabase[`${req.params.id}`] = req.body.longURL
  res.redirect("/urls");
})

// For login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);

  if (!user) {
    res.status(403).send('Email not found');
  }

  if (user) {
    if (user.password !== req.body.password) {
      res.status(403).send('Passwords do not match');
    }
  }

  res.cookie('user_id', user.id) // Sends user id to cookie
  res.redirect("/urls");
})

// For logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); 
  res.redirect("/login");
})

// For register
app.post("/register", (req, res) => { 
  const ran = random(); //this is where the random id generates
  const user = {
    id: ran,
    email: req.body.email,
    password: req.body.password
  }

  // Send error if empty fields are submitted
  if (user.email === "" || user.password === "") {
    res.status(400).send('Empty email and/or password field');
  }

  // Check is email has already been submitted
  const matchedUser = getUserByEmail(req.body.email)
  if (matchedUser) {
    res.status(400).send('Email already exists');
  }

  users[ran] = user;

  res.cookie('user_id', ran) // Sends random() value to cookie
  res.redirect("/urls");
})



//-----------------GETS-------------------------

// Redirects user to longURL site when using id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[`${req.params.id}`];
  res.redirect(longURL);
});

// My URLS page
app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]

  };
  // console.log(users);
  res.render("urls_index", templateVars);
});

// Create new tinyURL page
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]

  };
  res.render("urls_new", templateVars);
});

// Edit page
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`],
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`],
    user: users[user_id]
  };

  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`],
    user: users[user_id]
  };

  res.render("login", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});