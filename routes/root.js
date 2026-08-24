export default async (app, _opts) => {
  // Главная страница
  app.get("/", (_req, res) => res.view("index", { flash: res.flash() }));
};
