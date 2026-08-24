import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyCookie from "@fastify/cookie";
import flash from "@fastify/flash";
import formbody from "@fastify/formbody";
import fastifySession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import view from "@fastify/view";
import fp from "fastify-plugin";
import { Eta } from "eta";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обёртка fastify-plugin обязательна: без неё шаблонизатор, сессия и флеш
// остались бы видны только внутри этого файла, а обработчики лежат в routes.
export default fp(async (fastify) => {
  await fastify.register(formbody);

  // Собранный css лежит в dist: его пишет vite, поэтому каталог раздаётся
  // статикой, а не входит в исходники.
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "dist"),
    prefix: "/assets/",
  });

  await fastify.register(view, {
    engine: { eta: new Eta() },
    templates: path.join(__dirname, "..", "views"),
    defaultContext: {
      route(name, placeholdersValues) {
        return fastify.reverse(name, placeholdersValues);
      },
      assetPath(filename) {
        return `/assets/${filename}`;
      },
    },
  });

  // Схемы маршрутов описаны на yup, а fastify по умолчанию ждёт JSON Schema.
  // Компилятор объявлен один раз на всё приложение, поэтому маршрут указывает
  // только саму схему.
  fastify.setValidatorCompiler(({ schema }) => (data) => {
    try {
      return { value: schema.validateSync(data) };
    } catch (error) {
      return { error };
    }
  });

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: "a secret with minimum length of 32 characters",
  });

  await fastify.register(flash);
});
