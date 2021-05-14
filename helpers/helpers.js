const bcrypt = require("bcrypt");

const fetchUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = () => {
  const randomString = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  const length = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString.push(characters.charAt(Math.floor(Math.random() * length)));
  }
  return randomString.join('');
};

const createUser = (email, password, users) => {
  const newID = generateRandomString();
  const newUser = {
    newID,
    email,
    password
  };
  users[newID] = newUser;
  return users[newID];
};

const authenticateUser = (users, email, password) => {
  for (let id in users) {
    if (users[id].email === email) {
      if (bcrypt.compareSync(password, users[id].password)) {
        return id;
      }
    }
  }
  return null;
};

const getDate = () => {
  const today = new Date();
  const date = `${today.getFullYear()}/${(today.getMonth() + 1)}/${today.getDate()}`
  return date;
};

module.exports = {
  generateRandomString,
  fetchUserByEmail,
  createUser,
  authenticateUser,
  getDate
};