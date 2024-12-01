const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const { get } = require("request");
const app = express();
const PORT = 8080;  // default port 8080

app.set("view engine", "ejs");

// Example database for short/long URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Example users object to test registration and login 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur"),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk"),
  },
};

// Middleware to parse form data
// Take a form string and convert it into object(req.body)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

// URLs index route
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("<html><body><h1>You must be logged in to view your URLs. Please <a href='/login'>log in</a> or <a href='/register'>register</a>.</h1></body></html>");
  }
  const user = users[userId];
  const userUrls = urlsForUser(userId);
  const templateVars = {
    urls: userUrls,
    user: user
  };
  res.render("urls_index", templateVars);
});

// New URLs creation route
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  // Redirect to login if user is not logged in 
  if (!userId) {
    return res.redirect('/login');
  }
  const user = users[userId];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

// Handle new URL submission (POST)
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("<html><body><h1>You must be logged in to shorten URLs</h1></body></html>");
  }
  const shortURL = generateRandomString();
  // We can use req.body object to access longURL using longURL key 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  }
  res.redirect(`/urls/${shortURL}`);
});

// Show a specified URL route
app.get("/urls/:id", (req, res) => {
  //:id is a route paramter which is variable, we can access id using req.params.id
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const id = req.params.id;
  const urlData = urlDatabase[id]; // urlData is value of urlDatabase at key id or shortURL

  if (!urlData) {
    return res.status(404).send("<html><body><h1>URL not found!</h1></body></html>");
  }

  if (!userId) {
    return res.status(401).send("<html><body><h1>You must be logged in to view this URL. Please <a href='/login'>log in</a>.</h1></body></html>");
  }

  if (urlData.userID !== userId) {
    return res.status(403).send("You don't have authorization to view this URL");
  }
  const templateVars = {
    id: id,
    longURL: urlData.longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

// Redirect to long URL route
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id];
  if (!urlData) {
    return res.status(404).send("<html><body><h1>404 Error: Short URL not found</h1></body></html>");
  }
  res.redirect(urlData.longURL);
});

// POST route to delete URL resource
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const id = req.params.id;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send("<html><body><h1>URL not found!</h1></body></html>");
  }

  if (!userId) {
    return res.status(401).send("<html><body><h1>You must be logged in to delete this URL.</h1></body></html>");
  }

  if (urlData.userID !== userId) {
    return res.status(403).send("<html><body><h1>You don't have authorization to delete this URL.</h1></body></html>");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// POST route to edit longURL
app.post('/urls/:id/update', (req, res) => {
  const userId = req.cookies["user_id"];
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send("<html><body><h1>URL not found!</h1></body></html>");
  }

  if (!userId) {
    return res.status(401).send("<html><body><h1>You must be logged in to update this URL.</h1></body></html>");
  }

  if (urlData.userID !== userId) {
    return res.status(403).send("<html><body><h1>You don't have authorization to update this URL.</h1></body></html>");
  }
  urlDatabase[id].longURL = newLongURL;
  res.redirect('/urls');
});

// Get registration template
app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  // Checking if userID cookie is already set to check if user is logged in
  if (userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});

// POST route to handle registration
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // Condition to check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Please enter email and password");
  }

  // Condition to check if user has already exisiting email
  const exisitingUser = getUserByEmail(email);
  if (exisitingUser) {
    return res.status(400).send("Email is already registered");
  }

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = newUser;
  console.log(hashedPassword);
  // console.log(users);
  // Set the user ID in a cookie 
  res.cookie('user_id', id);
  res.redirect("/urls");
});

// Get route to serve new Login form
app.get('/login', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  // Checking if user is logged in 
  if (userId) {
    return res.redirect("/urls");
  }
  // User is considered null because it is not logged in  
  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});

// POST route to handle new login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  // If no user with that email exists, return 403 (Forbidden)
  if (!user) {
    return res.status(403).send("Invalid Email or password");
  }

  // If password doesn't match return 403 forbidden
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password entered");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

// POST route to handle logout 
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Simple Hello World route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Show URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

// Function to generate random string for short URLs
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

// Helper function to look up existing object by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

// Helper function to filter URLs based on the userID
function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    // Below we are checking if userID in our database is same as id cookie for logged in user
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}
