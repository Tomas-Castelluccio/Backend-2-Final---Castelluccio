const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JWTStrategy, ExtractJwt } = require("passport-jwt");
const UsersModel = require("../src/models/users.model");
const CartsModel = require("../src/models/carts.model");
const config = require("./config");

passport.use(
  "register",
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name, age } = req.body;

        if (!first_name || !last_name || !email || !age || !password) {
          return done(null, false, {
            message:
              "Todos los campos son obligatorios: first_name, last_name, email, age, password",
          });
        }

        const existing = await UsersModel.findOne({ email: email.toLowerCase() });
        if (existing) {
          return done(null, false, { message: "El email ya está registrado" });
        }

        const ageNumber = Number(age);
        if (typeof password !== "string" || password.length < 6) {
          return done(null, false, { message: "password debe tener al menos 6 caracteres" });
        }
        if (isNaN(ageNumber) || ageNumber < 0) {
          return done(null, false, { message: "age debe ser un número mayor o igual a 0" });
        }

        const cart = await CartsModel.create({ products: [] });

        const user = await UsersModel.create({
          first_name,
          last_name,
          email: email.toLowerCase(),
          age: ageNumber,
          password,
          cart: cart._id,
          role: req.body.role && ["user", "admin"].includes(req.body.role) ? req.body.role : "user",
        });

        cart.owner = user._id;
        await cart.save();

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await UsersModel.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: "Credenciales inválidas" });
        }

        const isValid = user.comparePassword(password);
        if (!isValid) {
          return done(null, false, { message: "Credenciales inválidas" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await UsersModel.findById(payload.id).select("-password");
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

const passportCall = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      if (strategy === "jwt") {
        return res.status(401).json({
          message: info && info.message ? info.message : "Token inválido o expirado",
        });
      }
      const status = strategy === "register" ? 400 : 401;
      const message = info && info.message ? info.message : "No autorizado";
      return res.status(status).json({ message });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { passport, passportCall };