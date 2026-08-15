// @ts-check

import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyCookie from "@fastify/cookie";
import flash from "@fastify/flash";
import formbody from "@fastify/formbody";
import fastifySession from "@fastify/secure-session";
import view from "@fastify/view";
import fp from "fastify-plugin";
import { plugin as fastifyReverseRoutes } from "fastify-reverse-routes";
import pug from "pug";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обёртка fastify-plugin обязательна: без неё шаблонизатор, сессия и флеш
// остались бы видны только внутри этого файла, а обработчики лежат в routes.
export default fp(async (fastify) => {
  await fastify.register(fastifyReverseRoutes);
  await fastify.register(formbody);

  await fastify.register(view, {
    engine: { pug },
    templates: path.join(__dirname, "..", "views"),
    defaultContext: {
      /** @type {(name: string, placeholdersValues?: any) => string} */
      route(name, placeholdersValues) {
        return fastify.reverse(name, placeholdersValues);
      },
    },
  });

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: "a secret with minimum length of 32 characters",
  });

  await fastify.register(flash);
});
