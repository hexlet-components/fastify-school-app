import * as yup from "yup";

const studentSchema = {
  body: yup.object({
    name: yup.string().required("Укажите имя").min(2),
    email: yup.string().required("Укажите email").email("Неверный формат email"),
    birthYear: yup
      .number()
      .typeError("Год рождения должен быть числом")
      .required("Укажите год рождения")
      .integer("Год рождения должен быть целым числом")
      .min(1900)
      .max(new Date().getFullYear()),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка студентов
  app.get("/students", { name: "students" }, async (req, res) => {
    const { name } = req.query;

    const { rows: students } = name
      ? await db.query("SELECT * FROM students WHERE name ILIKE $1", [`%${name}%`])
      : await db.query("SELECT * FROM students");

    return res.view("students/index", { students, flash: res.flash() });
  });

  // Форма создания нового студента
  app.get("/students/new", { name: "newStudent" }, (_req, res) => res.view("students/new"));

  // Просмотр конкретного студента
  app.get("/students/:id", { name: "student" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM students WHERE id = $1", [req.params.id]);
    const student = rows[0];

    if (!student) {
      return res.code(404).send("Student not found");
    }

    return res.view("students/show", { student, flash: res.flash() });
  });

  // Создание студента
  app.post("/students", { attachValidation: true, schema: studentSchema }, async (req, res) => {
    const { name, email, birthYear } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("students/new", { name, email, birthYear, flash: res.flash() });
    }

    await db.query("INSERT INTO students (name, email, birth_year) VALUES ($1, $2, $3)", [
      name,
      email,
      birthYear,
    ]);

    req.flash("success", "Студент успешно создан");
    return res.redirect(app.reverse("students"));
  });

  // Форма редактирования студента
  app.get("/students/:id/edit", { name: "editStudent" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM students WHERE id = $1", [req.params.id]);
    const student = rows[0];

    if (!student) {
      return res.code(404).send("Student not found");
    }

    return res.view("students/edit", { student, flash: res.flash() });
  });

  // Обновление студента
  app.patch(
    "/students/:id",
    { attachValidation: true, schema: studentSchema },
    async (req, res) => {
      const { id } = req.params;
      const { name, email, birthYear } = req.body;

      if (req.validationError) {
        req.flash("warning", req.validationError.message);
        return res.view("students/edit", {
          student: { id, name, email, birth_year: birthYear },
          flash: res.flash(),
        });
      }

      await db.query("UPDATE students SET name = $1, email = $2, birth_year = $3 WHERE id = $4", [
        name,
        email,
        birthYear,
        id,
      ]);

      req.flash("success", "Студент успешно отредактирован");
      return res.redirect(app.reverse("students"));
    },
  );

  // Удаление студента
  app.delete("/students/:id", async (req, res) => {
    await db.query("DELETE FROM students WHERE id = $1", [req.params.id]);

    req.flash("success", "Студент успешно удален");
    return res.redirect(app.reverse("students"));
  });
};
