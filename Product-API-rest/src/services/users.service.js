class UsersService {
  constructor(usersRepository, cartsRepository) {
    this.usersRepository = usersRepository;
    this.cartsRepository = cartsRepository;
  }

  #validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async getUserById(id) {
    if (!id) throw new Error("ID de usuario requerido");
    return this.usersRepository.findById(id);
  }

  async #validateUserData(data) {
    const { first_name, last_name, email, age, password } = data;

    if (!first_name || !last_name || !email || !age || !password) {
      throw new Error(
        "Todos los campos son obligatorios: first_name, last_name, email, age, password"
      );
    }
    if (typeof first_name !== "string" || typeof last_name !== "string") {
      throw new Error("first_name y last_name deben ser strings");
    }
    if (!this.#validateEmail(email)) throw new Error("Email inválido");
    if (typeof age !== "number" || age < 0) {
      throw new Error("age debe ser un número mayor o igual a 0");
    }
    if (typeof password !== "string" || password.length < 6) {
      throw new Error("password debe tener al menos 6 caracteres");
    }
    if (data.role && !["user", "admin"].includes(data.role)) {
      throw new Error("role debe ser 'user' o 'admin'");
    }
  }

  async createUser(data) {
    await this.#validateUserData(data);

    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new Error("El email ya está registrado");

    const cart = await this.cartsRepository.create();

    try {
      return await this.usersRepository.create({
        ...data,
        cart: cart.id,
        role: data.role || "user",
      });
    } catch (error) {
      await this.cartsRepository.delete(cart.id).catch(() => {});
      throw error;
    }
  }

  async updateUser(id, fields) {
    if (!id) throw new Error("ID de usuario requerido");

    const user = await this.usersRepository.findById(id);
    if (!user) throw new Error("Usuario no encontrado");

    if (fields.email !== undefined) {
      if (!this.#validateEmail(fields.email)) throw new Error("Email inválido");
      const existing = await this.usersRepository.findByEmail(fields.email);
      if (existing && existing.id !== id) throw new Error("El email ya está registrado");
    }
    if (fields.password !== undefined && fields.password !== "") {
      if (typeof fields.password !== "string" || fields.password.length < 6) {
        throw new Error("password debe tener al menos 6 caracteres");
      }
    }
    if (fields.age !== undefined && (typeof fields.age !== "number" || fields.age < 0)) {
      throw new Error("age debe ser un número mayor o igual a 0");
    }
    if (fields.role !== undefined && !["user", "admin"].includes(fields.role)) {
      throw new Error("role debe ser 'user' o 'admin'");
    }

    try {
      return this.usersRepository.update(id, fields);
    } catch (error) {
      if (error.code === 11000) throw new Error("El email ya está registrado");
      throw error;
    }
  }

  async deleteUser(id) {
    if (!id) throw new Error("ID de usuario requerido");

    const user = await this.usersRepository.findById(id);
    if (!user) throw new Error("Usuario no encontrado");

    if (user.cart) {
      await this.cartsRepository.delete(user.cart).catch(() => {});
    }

    return this.usersRepository.delete(id);
  }
}

module.exports = UsersService;
