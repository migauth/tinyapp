const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

// Sets a base object for the database
let urlDatabase = {
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
  userRandomID: { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" },
  user2RandomID: { id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk" }
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//-----------------FUNCTIONS-------------------------

// Function that generates random strings
const random = function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

// Returns object if email matches and null if not
const getUserByEmail = function (email) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

// Returns URLs if matching user
const urlsForUser = function (id) {
  let newUrlDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newUrlDatabase[key] = urlDatabase[key]
    }
  }
  return newUrlDatabase;
};
console.log(urlsForUser('aJ48lW'))

//-----------------POSTS-------------------------

//---URLS---//

// Generates a random string for the id, updates the database with the id - longURL key value pair
app.post("/urls", (req, res) => {
  let user_id = req.cookies["user_id"]
  const newURL = {
    longURL: req.body.longURL,
    userID: user_id
  }

  if (!user_id) {
    return res.status(400).send('Not logged in! Cannot shorten urls.');
  }

  const ran = random();
  urlDatabase[ran] = newURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${ran}`);
});

// For deleting urls
app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.cookies["user_id"]
  let id = req.params.id;

  if (!user_id) {
    return res.status(400).send('Cannot delete - wrong user id!');
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (user_id === urlDatabase[id].userID) {
    delete urlDatabase[id];
    return res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have authorization to delete this");
  }
});

// For editing urls
app.post("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"]
  let id = req.params.id;

  if (!user_id) {
    return res.status(400).send('Cannot edit - wrong user id!');
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (user_id === urlDatabase[id].userID) {
    const newURL = {
      longURL: req.body.longURL,
      userID: urlDatabase[id].userID
    }
    urlDatabase[id] = newURL;
    return res.redirect("/urls");
  } else {
    return res.status(403).send("You do not have authorization to edit this");
  }
});

//---LOGIN/REGISTER---//

// For login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);

  console.log(bcrypt.compareSync(req.body.password, user.password));
  // console.log(user.password);

  if (!user) {
    return res.status(403).send('Email not found');
  }

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password) === false) {
      return res.status(403).send('Passwords do not match');
    }
  }

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password) === true) {
      res.cookie('user_id', user.id) // Sends user id to cookie
      res.redirect("/urls");
    }
  }
  // console.log(users);
})

// For logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
})

// For register
app.post("/register", (req, res) => {
  const ran = random(); //this is where the random id generates

  const password = req.body.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log(hashedPassword);

  const user = {
    id: ran,
    email: req.body.email,
    password: hashedPassword //this has to change to hashedPassword
  }

  // Send error if empty fields are submitted
  if (user.email === "" || user.password === "") {
    return res.status(400).send('Empty email and/or password field');
  }

  // Check is email has already been submitted
  const matchedUser = getUserByEmail(req.body.email)
  if (matchedUser) {
    return res.status(400).send('Email already exists');
  }

  users[ran] = user;
  // console.log(users);

  res.cookie('user_id', ran) // Sends random() value to cookie
  res.redirect("/urls");
})



//-----------------GETS-------------------------

// Redirects user to longURL site when using id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!longURL) { // Directly check if the longURL for the given id exists
    // If the longURL does not exist, send a 400 error message and stop further execution
    return res.status(400).send('URL not in database');
  }

  // If longURL exists, redirect to it
  res.redirect(longURL);
});

// My URLS page
app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"]
  if (user_id) {
    const templateVars = {
      urls: urlsForUser(user_id),
      user: users[user_id]
    };
    return res.render("urls_index", templateVars);
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]

  };
  res.render("urls_index", templateVars);
});

// Create new tinyURL page
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"]
  if (!user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]

  };
  res.render("urls_new", templateVars);
});

// Edit page
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"]
  const id = req.params.id;
  const databaseID = urlDatabase[id].userID;

  if (!user_id) {
    return res.send('Not logged in!');
  }

  if (databaseID !== user_id) {
    return res.send('wrong permissions')
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"]
  if (user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[user_id]
  };

  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"]
  if (user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
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