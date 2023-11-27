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



// Function that generates random strings
const random = function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

// 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
  const user = req.body.user;
  res.cookie('user_id', user); //this needs to change to users_id
  res.redirect("/urls");
})

// For logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //this needs to change to users_id
  res.redirect("/urls");
})

// For register
app.post("/register", (req, res) => { //this is where the random id generates
  const ran = random();
  const user = {
      id: ran,
      email: req.body.email,
      password: req.body.password
    }

  users[`${ran}`] = user;
  console.log(users);
  res.cookie('user_id', ran)
  res.redirect("/urls");
})

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

// 
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"]
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[`${req.params.id}`],
    user: users[user_id]
    };

    //insert the randomized id here?
  
    res.render("register", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});