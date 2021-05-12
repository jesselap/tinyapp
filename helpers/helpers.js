const userExists = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  let randomString = [];
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let length = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString.push(characters.charAt(Math.floor(Math.random() * length)));
  }
  return randomString.join('');
}

const createUser = (email, password, users) => {
  const newID = generateRandomString();
  const newUser = {
    newID,
    email,
    password
  };
  users[newID] = newUser
  return users[newID];
};

const fetchUser = (users, email, password) => {
  for (let id in users) {
    if (users[id].email === email) {
      if (users[id].password === password) {
        return id;
      } else {
        console.log("Error: invalid password");
      }
    } else {
      console.log("Error: invalid email");
    }
  }
  return null;
};

module.exports = {
  generateRandomString,
  userExists,
  createUser,
  fetchUser
};