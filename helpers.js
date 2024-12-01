// Helper function to look up existing object by email
function getUserByEmail(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

// Helper function to filter URLs based on the userID
function urlsForUser(id, database) {
  const userUrls = {};
  for (const shortURL in database) {
    // Below we are checking if userID in our database is same as id cookie for logged in user
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
}


module.exports = { getUserByEmail, urlsForUser };