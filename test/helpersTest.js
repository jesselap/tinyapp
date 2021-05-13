const { assert } = require('chai');

const {
  generateRandomString,
  fetchUserByEmail,
  createUser,
  authenticateUser
} = require('../helpers/helpers.js');

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
    const user = fetchUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it("should return undefined when passed an email not in the database", () => {
    const user = fetchUserByEmail("thisdoesnot@exist.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});