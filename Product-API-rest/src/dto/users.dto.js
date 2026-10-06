const toUserId = (user) => (user._id || user.id).toString();

const toCartId = (cart) => {
  if (!cart) return null;
  return cart._id ? cart._id.toString() : cart.toString();
};

const toSafeUserDto = (user) => {
  if (!user) return null;
  return {
    id: toUserId(user),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    cart: toCartId(user.cart),
    role: user.role,
  };
};

const toCurrentUserDto = (user) => {
  if (!user) return null;
  return {
    id: toUserId(user),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    cart: toCartId(user.cart),
    role: user.role,
  };
};

module.exports = { toSafeUserDto, toCurrentUserDto };