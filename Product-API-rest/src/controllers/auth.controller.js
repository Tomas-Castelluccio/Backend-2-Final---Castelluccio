class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = (req, res) => {
    const user = this.authService.toSafeUser(req.user);
    const token = this.authService.generateToken(req.user);
    res.status(201).json({ user, token });
  };

  login = (req, res) => {
    const user = this.authService.toSafeUser(req.user);
    const token = this.authService.generateToken(req.user);
    res.json({ user, token });
  };

  current = (req, res) => {
    const user = this.authService.toCurrentUser(req.user);
    res.json({ user });
  };

  logout = (req, res) => {
    res.json({ message: "Sesión cerrada correctamente" });
  };
}

module.exports = AuthController;