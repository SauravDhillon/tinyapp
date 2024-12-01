const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');
const assertEqual = require('../../lotide/assertEqual.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(user, testUsers[expectedUserID]);
  });
  it('should return undefined for an email that does not exist', function() {
    const user1 = getUserByEmail("hello@example.com", testUsers);
    assert.notExists(user1);
  })
});