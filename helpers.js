// Returns object if email matches and null if not
const getUserByEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

// Function that generates random strings
const random = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, random };