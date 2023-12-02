// Server for Tinyapp

// Import express
const express = require("express");
const app = express();
const PORT = 8080;

// Import cookieSession and bcrypt for encryption
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

// Sets a base object for the database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

// Set a base object for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Setup for cookie encryption
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//-----------------FUNCTIONS-------------------------

// Import functions
const { getUserByEmail, random } = require('./helpers');

// Returns URLs if matching user
const urlsForUser = function (id) {
  const newUrlDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newUrlDatabase[key] = urlDatabase[key];
    }
  }
  return newUrlDatabase;
};

//-----------------POST ROUTES-------------------------

//---URLS---//

// Generates a random string for the id, updates the database with the id - longURL key value pair
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const newURL = {
    longURL: req.body.longURL,
    userID: userId
  };

  // Check if user is logged in
  if (!userId) {
    return res.status(400).send('Not logged in! Cannot shorten urls.');
  }

  // Create a new URL
  const ran = random();
  urlDatabase[ran] = newURL;
  res.redirect(`/urls/${ran}`);
});

// For deleting urls
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;

  // Check if correct user
  if (!userId) {
    return res.status(400).send('Cannot delete - wrong user id!');
  }

  // Check if URL is in database
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (userId === urlDatabase[id].userID) {
    delete urlDatabase[id];
    return res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have authorization to delete this");
  }
});

// For editing urls
app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;

  // Check if correct user
  if (!userId) {
    return res.status(400).send('Cannot edit - wrong user id!');
  }

  // Check if URL is in database
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  // If correct user allow editing
  if (userId === urlDatabase[id].userID) {
    const newURL = {
      longURL: req.body.longURL,
      userID: urlDatabase[id].userID
    };
    urlDatabase[id] = newURL;
    return res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have authorization to edit this");
  }
});

//---LOGIN/REGISTER---//

// For login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  // Check if user exists
  if (!user) {
    return res.status(403).send('Email not found');
  }

  // Check if correct password
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password) === false) {
      return res.status(403).send('Passwords do not match');
    }
  }

  // Login if user exists and password matches
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password) === true) {
      req.session.userId = user.id; //Set cookie session
      res.redirect("/urls");
    }
  }
});

// For logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// For register
app.post("/register", (req, res) => {
  const ran = random();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create a new user
  const user = {
    id: ran,
    email: req.body.email,
    password: hashedPassword
  };

  // Send error if empty fields are submitted
  if (user.email === "" || user.password === "") {
    return res.status(400).send('Empty email and/or password field');
  }

  // Check is email has already been submitted
  const matchedUser = getUserByEmail(req.body.email, users);
  if (matchedUser) {
    return res.status(400).send('Email already exists');
  }

  // Assign random id to new user
  users[ran] = user;

  req.session.userId = ran; //Set cookie session
  res.redirect("/urls");
});



//-----------------GET ROUTES-------------------------

// Redirects user to longURL site when using id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  // Check if longURL exists
  if (!urlDatabase[id]) {
    return res.status(400).send('Short URL not in database');
  }

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// My URLS page
app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  // Filter URLs for matching user
  if (userId) {
    const templateVars = {
      urls: urlsForUser(userId),
      user: users[userId]
    };
    return res.render("urls_index", templateVars);
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render("urls_index", templateVars);
});

// Create new tinyURL page
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  // Can't add new URLs if not logged in
  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };

  res.render("urls_new", templateVars);
});

// Edit page
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const id = req.params.id;
  const databaseID = urlDatabase[id].userID;

  // Check if loggin in
  if (!userId) {
    return res.send('Not logged in!');
  }

  // Can't edit if wrong user
  if (databaseID !== userId) {
    return res.send('Wrong permissions');
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userId]
  };

  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };

  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };

  res.render("login", templateVars);
});

// Fetch JSON data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Listen for connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});