import * as yup from "yup";

const courseSchema = {
  body: yup.object({
    title: yup.string().min(2),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка курсов
  app.get("/courses", { name: "courses" }, async (req, res) => {
    const { title } = req.query;

    const { rows: courses } = title
      ? await db.query("SELECT * FROM courses WHERE title ILIKE $1", [`%${title}%`])
      : await db.query("SELECT * FROM courses");

    return res.view("courses/index", { courses, flash: res.flash() });
  });

  // Форма создания нового курса
  app.get("/courses/new", { name: "newCourse" }, (_req, res) => res.view("courses/new"));

  // Просмотр конкретного курса
  app.get("/courses/:id", { name: "course" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    const course = rows[0];

    if (!course) {
      return res.code(404).send("Course not found");
    }

    return res.view("courses/show", { course, flash: res.flash() });
  });

  // Создание курса
  app.post("/courses", { attachValidation: true, schema: courseSchema }, async (req, res) => {
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("courses/new", { title, description, flash: res.flash() });
    }

    await db.query("INSERT INTO courses (title, description) VALUES ($1, $2)", [
      title,
      description,
    ]);

    req.flash("success", "Курс успешно создан");
    return res.redirect(app.reverse("courses"));
  });

  // Форма редактирования курса
  app.get("/courses/:id/edit", { name: "editCourse" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    const course = rows[0];

    if (!course) {
      return res.code(404).send("Course not found");
    }

    return res.view("courses/edit", { course, flash: res.flash() });
  });

  // Обновление курса
  app.patch("/courses/:id", { attachValidation: true, schema: courseSchema }, async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("courses/edit", { course: { id, title, description }, flash: res.flash() });
    }

    await db.query("UPDATE courses SET title = $1, description = $2 WHERE id = $3", [
      title,
      description,
      id,
    ]);

    req.flash("success", "Курс успешно отредактирован");
    return res.redirect(app.reverse("courses"));
  });

  // Удаление курса
  app.delete("/courses/:id", async (req, res) => {
    await db.query("DELETE FROM courses WHERE id = $1", [req.params.id]);

    req.flash("success", "Курс успешно удален");
    return res.redirect(app.reverse("courses"));
  });
};
