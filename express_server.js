const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");


// Sets a base object for the database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

// Function that generates random strings
const random = function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

// 
app.use(express.urlencoded({ extended: true }));


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

// For editing urls ???
app.post("/urls/:id", (req, res) => {
  urlDatabase[`${req.params.id}`] = req.body.longURL
  // console.log(req.body.longURL); //THIS is correct
  res.redirect("/urls");
})

// Redirects user to longURL site when using id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[`${req.params.id}`];
  res.redirect(longURL);
});

// My URLS page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// Create new tinyURL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[`${req.params.id}`]};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});