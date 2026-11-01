import * as yup from "yup";

const lessonSchema = {
  body: yup.object({
    title: yup.string().required().min(3),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка уроков
  app.get("/lessons", { name: "lessons" }, async (req, res) => {
    const { title } = req.query;

    const { rows: lessons } = title
      ? await db.query("SELECT * FROM lessons WHERE title ILIKE $1", [`%${title}%`])
      : await db.query("SELECT * FROM lessons");

    return res.view("lessons/index", { lessons, flash: res.flash() });
  });

  // Форма создания нового урока
  app.get("/lessons/new", { name: "newLesson" }, (_req, res) => res.view("lessons/new"));

  // Просмотр конкретного урока
  app.get("/lessons/:id", { name: "lesson" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM lessons WHERE id = $1", [req.params.id]);
    const lesson = rows[0];

    if (!lesson) {
      return res.code(404).send("Lesson not found");
    }

    return res.view("lessons/show", { lesson, flash: res.flash() });
  });

  // Создание урока
  app.post("/lessons", { attachValidation: true, schema: lessonSchema }, async (req, res) => {
    const { title, content } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("lessons/new", { title, content, flash: res.flash() });
    }

    await db.query("INSERT INTO lessons (title, content) VALUES ($1, $2)", [title, content]);

    req.flash("success", "Урок успешно создан");
    return res.redirect(app.reverse("lessons"));
  });

  // Форма редактирования урока
  app.get("/lessons/:id/edit", { name: "editLesson" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM lessons WHERE id = $1", [req.params.id]);
    const lesson = rows[0];

    if (!lesson) {
      return res.code(404).send("Lesson not found");
    }

    return res.view("lessons/edit", { lesson, flash: res.flash() });
  });

  // Обновление урока
  app.patch("/lessons/:id", { attachValidation: true, schema: lessonSchema }, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("lessons/edit", { lesson: { id, title, content }, flash: res.flash() });
    }

    await db.query("UPDATE lessons SET title = $1, content = $2 WHERE id = $3", [
      title,
      content,
      id,
    ]);

    req.flash("success", "Урок успешно отредактирован");
    return res.redirect(app.reverse("lessons"));
  });

  // Удаление урока
  app.delete("/lessons/:id", async (req, res) => {
    await db.query("DELETE FROM lessons WHERE id = $1", [req.params.id]);

    req.flash("success", "Урок успешно удален");
    return res.redirect(app.reverse("lessons"));
  });
};
