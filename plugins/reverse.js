// @ts-check

import fp from "fastify-plugin";

// Именованные маршруты и app.reverse(name).
//
// Раньше это делал пакет fastify-reverse-routes, но он заброшен и держит реестр
// маршрутов в переменной модуля, одной на весь процесс: тесты поднимают
// приложение по разу на файл, и второй подъём падал на «Route with name root
// already registered». Здесь реестр живёт на самом инстансе, поэтому каждое
// приложение начинает с чистого листа.
const reversePlugin = (app, _options, done) => {
  const routes = new Map();

  app.decorate("reverse", (name, params = {}) => {
    const url = routes.get(name);
    if (!url) {
      throw new Error(`Route with name ${name} is not registered`);
    }
    return url.replace(/:(\w+)/g, (_match, key) => {
      if (!(key in params)) {
        throw new Error(`Route ${name} needs param ${key}`);
      }
      return params[key];
    });
  });

  app.addHook("onRoute", ({ name, url, method }) => {
    if (!name) {
      return;
    }
    // HEAD fastify заводит сам, парой к GET, и имя у него то же самое
    if (method === "HEAD") {
      return;
    }
    if (routes.has(name)) {
      throw new Error(`Route with name ${name} already registered`);
    }
    routes.set(name, url);
  });

  done();
};

export default fp(reversePlugin, { fastify: ">= 4", name: "reverse" });
