import * as yup from "yup";

const teacherSchema = {
  body: yup.object({
    name: yup.string().min(2),
    email: yup.string().email(),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка преподавателей
  app.get("/teachers", { name: "teachers" }, async (req, res) => {
    const { name } = req.query;

    const { rows: teachers } = name
      ? await db.query("SELECT * FROM teachers WHERE name ILIKE $1", [`%${name}%`])
      : await db.query("SELECT * FROM teachers");

    return res.view("teachers/index", { teachers, flash: res.flash() });
  });

  // Форма создания нового преподавателя
  app.get("/teachers/new", { name: "newTeacher" }, (_req, res) => res.view("teachers/new"));

  // Просмотр конкретного преподавателя
  app.get("/teachers/:id", { name: "teacher" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM teachers WHERE id = $1", [req.params.id]);
    const teacher = rows[0];

    if (!teacher) {
      return res.code(404).send("Teacher not found");
    }

    return res.view("teachers/show", { teacher, flash: res.flash() });
  });

  // Создание преподавателя
  app.post("/teachers", { attachValidation: true, schema: teacherSchema }, async (req, res) => {
    const { name, email } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("teachers/new", { name, email, flash: res.flash() });
    }

    await db.query("INSERT INTO teachers (name, email) VALUES ($1, $2)", [name, email]);

    req.flash("success", "Преподаватель успешно создан");
    return res.redirect(app.reverse("teachers"));
  });

  // Форма редактирования преподавателя
  app.get("/teachers/:id/edit", { name: "editTeacher" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM teachers WHERE id = $1", [req.params.id]);
    const teacher = rows[0];

    if (!teacher) {
      return res.code(404).send("Teacher not found");
    }

    return res.view("teachers/edit", { teacher, flash: res.flash() });
  });

  // Обновление преподавателя
  app.patch(
    "/teachers/:id",
    { attachValidation: true, schema: teacherSchema },
    async (req, res) => {
      const { id } = req.params;
      const { name, email } = req.body;

      if (req.validationError) {
        req.flash("warning", req.validationError.message);
        return res.view("teachers/edit", { teacher: { id, name, email }, flash: res.flash() });
      }

      await db.query("UPDATE teachers SET name = $1, email = $2 WHERE id = $3", [name, email, id]);

      req.flash("success", "Преподаватель успешно отредактирован");
      return res.redirect(app.reverse("teachers"));
    },
  );

  // Удаление преподавателя
  app.delete("/teachers/:id", async (req, res) => {
    await db.query("DELETE FROM teachers WHERE id = $1", [req.params.id]);

    req.flash("success", "Преподаватель успешно удален");
    return res.redirect(app.reverse("teachers"));
  });
};
