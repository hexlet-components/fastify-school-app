// @ts-check

export default (app, db) => {
  // Главная страница
  app.get('/', (req, res) => {
    const templateData = {
      flash: res.flash(),
    };
    res.view('index', templateData);
  });
};
