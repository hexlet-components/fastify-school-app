// @ts-check

import fp from "fastify-plugin";
import sqlite3 from "sqlite3";

// Обёртка fastify-plugin обязательна: без неё всё, что плагин добавляет в
// приложение, остаётся внутри самого плагина и до обработчиков не доходит.
export default fp(async (fastify) => {
  const db = new sqlite3.Database(":memory:");

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
    {
      id: 1,
      title: "JavaScript",
      description: "Курс по языку программирования JavaScript",
    },
    { id: 2, title: "Fastify", description: "Курс по фреймворку Fastify" },
  ];

  const users = [{ id: 1, name: "admin", email: "admin@example.com", password: "admin" }];

  const stmtCourses = db.prepare("INSERT INTO courses VALUES (?, ?, ?)");
  courses.forEach((course) => {
    stmtCourses.run(course.id, course.title, course.description);
  });
  stmtCourses.finalize();

  const stmtUsers = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
  users.forEach((user) => {
    stmtUsers.run(user.id, user.name, user.email, user.password);
  });
  stmtUsers.finalize();

  fastify.decorate("db", db);
  fastify.addHook("onClose", (_instance, done) => {
    db.close(() => done());
  });
});
