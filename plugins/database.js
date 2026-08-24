import { DatabaseSync } from "node:sqlite";
import fp from "fastify-plugin";

// Обёртка fastify-plugin обязательна: без неё всё, что плагин добавляет в
// приложение, остаётся внутри самого плагина и до обработчиков не доходит.
export default fp(async (fastify) => {
  const db = new DatabaseSync(":memory:");

  db.exec(`
    CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT
    );

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);

  const courses = [
    { title: "JavaScript", description: "Курс по языку программирования JavaScript" },
    { title: "Fastify", description: "Курс по фреймворку Fastify" },
  ];

  const insertCourse = db.prepare("INSERT INTO courses (title, description) VALUES (?, ?)");
  courses.forEach((course) => {
    insertCourse.run(course.title, course.description);
  });

  const users = [{ name: "admin", email: "admin@example.com", password: "admin" }];

  const insertUser = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  users.forEach((user) => {
    insertUser.run(user.name, user.email, user.password);
  });

  fastify.decorate("db", db);
  fastify.addHook("onClose", () => db.close());
});
