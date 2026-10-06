class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  getAllUsers = async (req, res, next) => {
    try {
      const users = await this.usersService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const { uid } = req.params;
      const user = await this.usersService.getUserById(uid);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req, res, next) => {
    try {
      const newUser = await this.usersService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const { uid } = req.params;
      const updatedUser = await this.usersService.updateUser(uid, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const { uid } = req.params;
      const deletedId = await this.usersService.deleteUser(uid);
      res.json({ id: deletedId, message: "Usuario eliminado" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UsersController;