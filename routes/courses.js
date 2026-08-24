import * as yup from "yup";

const courseSchema = {
  body: yup.object({
    title: yup.string().min(2),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка курсов
  app.get("/courses", { name: "courses" }, (req, res) => {
    const { title } = req.query;

    const courses = title
      ? db.prepare("SELECT * FROM courses WHERE title LIKE ?").all(`%${title}%`)
      : db.prepare("SELECT * FROM courses").all();

    res.view("courses/index", { courses, flash: res.flash() });
  });

  // Форма создания нового курса
  app.get("/courses/new", { name: "newCourse" }, (_req, res) => res.view("courses/new"));

  // Просмотр конкретного курса
  app.get("/courses/:id", { name: "course" }, (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);

    if (!course) {
      res.code(404).send("Course not found");
      return;
    }

    res.view("courses/show", { course, flash: res.flash() });
  });

  // Создание курса
  app.post("/courses", { attachValidation: true, schema: courseSchema }, (req, res) => {
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      res.view("courses/new", { title, description, flash: res.flash() });
      return;
    }

    db.prepare("INSERT INTO courses (title, description) VALUES (?, ?)").run(title, description);

    req.flash("success", "Курс успешно создан");
    res.redirect(app.reverse("courses"));
  });

  // Форма редактирования курса
  app.get("/courses/:id/edit", { name: "editCourse" }, (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);

    if (!course) {
      res.code(404).send("Course not found");
      return;
    }

    res.view("courses/edit", { course, flash: res.flash() });
  });

  // Обновление курса
  app.patch("/courses/:id", { attachValidation: true, schema: courseSchema }, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      res.view("courses/edit", { course: { id, title, description }, flash: res.flash() });
      return;
    }

    db.prepare("UPDATE courses SET title = ?, description = ? WHERE id = ?").run(
      title,
      description,
      id,
    );

    req.flash("success", "Курс успешно отредактирован");
    res.redirect(app.reverse("courses"));
  });

  // Удаление курса
  app.delete("/courses/:id", (req, res) => {
    db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);

    req.flash("success", "Курс успешно удален");
    res.redirect(app.reverse("courses"));
  });
};
