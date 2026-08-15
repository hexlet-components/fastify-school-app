// @ts-check

export default async (app, _opts) => {
  // Главная страница
  app.get("/", (/** @type {any} */ _req, /** @type {any} */ res) => {
    const templateData = {
      flash: res.flash(),
    };
    res.view("index", templateData);
  });
};
