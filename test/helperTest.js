// Test file for helper functions

// Import chai and functions
const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

// Base template for testing
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

// Tests
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user.id === expectedUserID);
  });

  it('should return null with invalid email', function() {
    const user = getUserByEmail("nobody@example.com", testUsers);
    assert(user === null);
  });
});
