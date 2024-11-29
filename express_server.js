const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;  // default port 8080

app.set("view engine", "ejs");

// Example database for short/long URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Example users object to test registration and login 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middleware to parse form data
// Take a form string and convert it into object(req.body)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// URLs index route
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

// New URLs creation route
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
})

// Show a specified URL route
app.get("/urls/:id", (req, res) => {
  //:id is a route paramter which is variable, we can access id using req.params.id
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  // edge case if longURL for given shortURL is not defined
  if (!longURL) {
    return res.status(404).send("URL not found!");
  }
  const templateVars = {
    id: id,
    longURL: longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

// Redirect to long URL route
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.status(404).send("URL not found!");
  }
  res.redirect(longURL);
});

// Show URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Handle new URL submission (POST)
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // We can use req.body object to access longURL using longURL key 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST route to remove URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
  }
  res.redirect("/urls");
});

// POST route to edit longURL
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
  }
  res.redirect('/urls');
});

// POST route to handle new login
app.post('/login', (req, res) => {
  const userId = req.body.user_id;
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

// POST route to handle logout 
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Get registration template
app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    user: user
  };
  res.render("register", templateVars);
});

// POST route to handle registration
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  users[id] = newUser;
  // console.log(users);
  res.cookie('user_id', id);
  res.redirect("/urls");
});

// Simple Hello World route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

// Function to generate random string for short URLs
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};