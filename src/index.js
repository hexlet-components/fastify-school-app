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

import addRoutes from './routes/index.js';

export default () => {
  const __dirname = fileURLToPath(path.dirname(import.meta.url));
  const app = fastify();

  const db = new sqlite3.Database(':memory:');

  const prepareDatabase = () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE courses (
          id INT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT
        )
      `);
      db.run(`
        CREATE TABLE users (
          id INT PRIMARY KEY,
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

  addRoutes(app, db);

  app.register(formbody);
  app.register(view, {
    engine: {
      pug,
    },
    templates: path.join(__dirname, 'views'),
  });
  app.decorateReply('render', function render(viewPath, locals) {
    console.log(locals);
    this.view(viewPath, { ...locals, reply: this });
  });
  app.register(fastifyReverseRoutes);
  app.register(fastifyCookie);
  app.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
  });

  app.register(flash);

  return app;
};
