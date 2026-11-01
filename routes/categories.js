import * as yup from "yup";

const categorySchema = {
  body: yup.object({
    title: yup.string().min(2),
  }),
};

export default async (app, _opts) => {
  const { db } = app;

  // Просмотр списка категорий
  app.get("/categories", { name: "categories" }, async (req, res) => {
    const { title } = req.query;

    const { rows: categories } = title
      ? await db.query("SELECT * FROM categories WHERE title ILIKE $1", [`%${title}%`])
      : await db.query("SELECT * FROM categories");

    return res.view("categories/index", { categories, flash: res.flash() });
  });

  // Форма создания новой категории
  app.get("/categories/new", { name: "newCategory" }, (_req, res) => res.view("categories/new"));

  // Просмотр конкретной категории
  app.get("/categories/:id", { name: "category" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    const category = rows[0];

    if (!category) {
      return res.code(404).send("Category not found");
    }

    return res.view("categories/show", { category, flash: res.flash() });
  });

  // Создание категории
  app.post("/categories", { attachValidation: true, schema: categorySchema }, async (req, res) => {
    const { title } = req.body;

    if (req.validationError) {
      req.flash("warning", req.validationError.message);
      return res.view("categories/new", { title, flash: res.flash() });
    }

    await db.query("INSERT INTO categories (title) VALUES ($1)", [title]);

    req.flash("success", "Категория успешно создана");
    return res.redirect(app.reverse("categories"));
  });

  // Форма редактирования категории
  app.get("/categories/:id/edit", { name: "editCategory" }, async (req, res) => {
    const { rows } = await db.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    const category = rows[0];

    if (!category) {
      return res.code(404).send("Category not found");
    }

    return res.view("categories/edit", { category, flash: res.flash() });
  });

  // Обновление категории
  app.patch(
    "/categories/:id",
    { attachValidation: true, schema: categorySchema },
    async (req, res) => {
      const { id } = req.params;
      const { title } = req.body;

      if (req.validationError) {
        req.flash("warning", req.validationError.message);
        return res.view("categories/edit", { category: { id, title }, flash: res.flash() });
      }

      await db.query("UPDATE categories SET title = $1 WHERE id = $2", [title, id]);

      req.flash("success", "Категория успешно отредактирована");
      return res.redirect(app.reverse("categories"));
    },
  );

  // Удаление категории
  app.delete("/categories/:id", async (req, res) => {
    await db.query("DELETE FROM categories WHERE id = $1", [req.params.id]);

    req.flash("success", "Категория успешно удалена");
    return res.redirect(app.reverse("categories"));
  });
};
