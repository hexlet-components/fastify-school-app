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
  app.get("/users", { name: "users" }, (_req, res) => {
    const users = db.prepare("SELECT * FROM users").all();

    res.view("users/index", { users, flash: res.flash() });
  });

  // Форма создания нового пользователя
  app.get("/users/new", { name: "newUser" }, (_req, res) =>
    res.view("users/new", { flash: res.flash() }),
  );

  // Просмотр конкретного пользователя
  app.get("/users/:id", { name: "user" }, (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);

    if (!user) {
      res.code(404).send("User not found");
      return;
    }

    res.view("users/show", { user, flash: res.flash() });
  });

  // Создание пользователя
  app.post("/users", { attachValidation: true, schema: userSchema }, (req, res) => {
    const { name, email, password } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      res.view("users/new", { name, email, flash: res.flash() });
      return;
    }

    db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(
      name,
      email,
      password,
    );

    req.flash("success", "Пользователь успешно создан");
    res.redirect(app.reverse("users"));
  });

  // Форма редактирования пользователя
  app.get("/users/:id/edit", { name: "editUser" }, (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);

    if (!user) {
      res.code(404).send("User not found");
      return;
    }

    res.view("users/edit", { user, flash: res.flash() });
  });

  // Обновление пользователя
  app.patch("/users/:id", { attachValidation: true, schema: userSchema }, (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      res.view("users/edit", { user: { id, name, email }, flash: res.flash() });
      return;
    }

    db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(
      name,
      email,
      password,
      id,
    );

    req.flash("success", "Пользователь успешно отредактирован");
    res.redirect(app.reverse("users"));
  });

  // Удаление пользователя
  app.delete("/users/:id", (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    req.flash("success", "Пользователь успешно удален");
    res.redirect(app.reverse("users"));
  });
};
