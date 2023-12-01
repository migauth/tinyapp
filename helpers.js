// Returns object if email matches and null if not
const getUserByEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return null;
};

module.exports = { getUserByEmail };