// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';
import fastify from 'fastify';
import sqlite3 from 'sqlite3';
import view from '@fastify/view';
import pug from 'pug';
import formbody from '@fastify/formbody';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import flash from '@fastify/flash';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/secure-session';
import fastifyMethodOverride from 'fastify-method-override';

import addRoutes from './routes/index.js';

export default async () => {
  const __dirname = fileURLToPath(path.dirname(import.meta.url));
  const app = fastify({ exposeHeadRoutes: false, logger: true });

  const db = new sqlite3.Database(':memory:');

  const prepareDatabase = () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT
        )
      `);
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);
    });

    const courses = [
      { id: 1, title: 'JavaScript', description: 'Курс по языку программирования JavaScript' },
      { id: 2, title: 'Fastify', description: 'Курс по фреймворку Fastify' },
    ];

    const users = [
      { id: 1, name: 'admin', email: 'admin@example.com', password: 'admin' },
    ];

    const stmtCourses = db.prepare('INSERT INTO courses VALUES (?, ?, ?)');

    courses.forEach((course) => {
      stmtCourses.run(course.id, course.title, course.description);
    });
    stmtCourses.finalize();

    const stmtUsers = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');

    users.forEach((user) => {
      stmtUsers.run(user.id, user.name, user.email, user.password);
    });

    stmtUsers.finalize();
  };

  prepareDatabase();

  await app.register(fastifyReverseRoutes);
  await app.register(formbody);
  await app.register(view, {
    engine: {
      pug,
    },
    templates: path.join(__dirname, 'views'),
    defaultContext: {
      route(name, placeholdersValues) {
        return app.reverse(name, placeholdersValues);
      },
    },
  });
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
  });
  await app.register(fastifyMethodOverride);

  await app.register(flash);

  addRoutes(app, db);
  return app;
};
