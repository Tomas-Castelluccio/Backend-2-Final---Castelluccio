const { passportCall } = require("../../config/passport");

const requireAuth = passportCall("jwt");

module.exports = { requireAuth };