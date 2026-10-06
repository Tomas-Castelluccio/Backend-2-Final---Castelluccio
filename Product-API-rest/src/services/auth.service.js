const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const { toSafeUserDto, toCurrentUserDto } = require("../dto/users.dto");

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: (user.id || user._id.toString()).toString(),
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        cart: user.cart ? (user.cart._id ? user.cart._id.toString() : user.cart.toString()) : null,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  toSafeUser(user) {
    return toSafeUserDto(user);
  }

  toCurrentUser(user) {
    return toCurrentUserDto(user);
  }
}

module.exports = AuthService;
