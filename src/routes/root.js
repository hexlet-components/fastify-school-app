// @ts-check

/**
 *
 * @param {any} app - Экземпляр Fastify
 */

export default (app) => {
  // Главная страница
  app.get('/', (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => {
    const templateData = {
      flash: res.flash(),
    }
    res.view('index', templateData)
  })
}
