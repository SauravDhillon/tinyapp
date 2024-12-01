const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user, testUsers[expectedUserID]);
  });
  it('should return undefined for an email that does not exist', function () {
    const user1 = getUserByEmail("hello@example.com", testUsers);
    assert.notExists(user1);
  })
});

describe('urlsForUser', function () {
  it('should return urls that belong to the specified user', function () {
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9smXx9': { longURL: 'http://www.google.com', userID: 'user2' }
    };

    const userUrls = urlsForUser('user1', urlDatabase);
    assert.deepEqual(userUrls, {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' }
    });
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', function () {
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9smXx9': { longURL: 'http://www.google.com', userID: 'user2' }
    };

    const userUrls = urlsForUser('user3', urlDatabase);
    assert.deepEqual(userUrls, {});
  });

  it('should return an empty object if the urlDatabase is empty', function () {
    const urlDatabase = {};

    const userUrls = urlsForUser('user1', urlDatabase);
    assert.deepEqual(userUrls, {});
  });

  it('should not return any urls that do not belong to the specified user', function () {
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9smXx9': { longURL: 'http://www.google.com', userID: 'user2' }
    };

    const userUrls = urlsForUser('user1', urlDatabase);
    assert.notProperty(userUrls, '9smXx9'); // ensure '9smXx9' is not included
  });
});