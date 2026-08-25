import * as yup from "yup";

const userSchema = {
  body: yup.object({
    name: yup.string().min(2),
    email: yup.string().email(),
    password: yup.string().min(5),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password")], "Пароль и подтверждение не совпадают"),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка пользователей
  app.get("/users", { name: "users" }, async (_req, res) => {
    const { rows: users } = await db.query("SELECT * FROM users");

    return res.view("users/index", { users, flash: res.flash() });
  });

  // Форма создания нового пользователя
  app.get("/users/new", { name: "newUser" }, (_req, res) =>
    res.view("users/new", { flash: res.flash() }),
  );

  // Просмотр конкретного пользователя
  app.get("/users/:id", { name: "user" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
    const user = rows[0];

    if (!user) {
      return res.code(404).send("User not found");
    }

    return res.view("users/show", { user, flash: res.flash() });
  });

  // Создание пользователя
  app.post("/users", { attachValidation: true, schema: userSchema }, async (req, res) => {
    const { name, email, password } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("users/new", { name, email, flash: res.flash() });
    }

    await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [
      name,
      email,
      password,
    ]);

    req.flash("success", "Пользователь успешно создан");
    return res.redirect(app.reverse("users"));
  });

  // Форма редактирования пользователя
  app.get("/users/:id/edit", { name: "editUser" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
    const user = rows[0];

    if (!user) {
      return res.code(404).send("User not found");
    }

    return res.view("users/edit", { user, flash: res.flash() });
  });

  // Обновление пользователя
  app.patch("/users/:id", { attachValidation: true, schema: userSchema }, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("users/edit", { user: { id, name, email }, flash: res.flash() });
    }

    await db.query("UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4", [
      name,
      email,
      password,
      id,
    ]);

    req.flash("success", "Пользователь успешно отредактирован");
    return res.redirect(app.reverse("users"));
  });

  // Удаление пользователя
  app.delete("/users/:id", async (req, res) => {
    await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);

    req.flash("success", "Пользователь успешно удален");
    return res.redirect(app.reverse("users"));
  });
};
