const userMessages = require("../user/user.messages");
const authMessages = require("../auth/auth.messages");

module.exports = {
  USER: userMessages,
  AUTH: authMessages,
  SERVER: {
    ERROR_UNAUTHORIZED: "You are not authorized to perform this operation.",
    ERROR_GETTING_MONGO_USER:
      "Something went wrong while fetching mongoDB user."
  }
};
