import { PGlite } from "@electric-sql/pglite";
import fp from "fastify-plugin";

// База это PostgreSQL, но поднимается она внутри процесса: PGlite это тот же
// postgres, собранный в WebAssembly. Демо запускается одной командой и при этом
// говорит с той же СУБД, что курс и учебные проекты.
//
// Обёртка fastify-plugin обязательна: без неё всё, что плагин добавляет в
// приложение, остаётся внутри самого плагина и до обработчиков не доходит.
export default fp(async (fastify) => {
  const db = new PGlite();

  await db.exec(`
    CREATE TABLE courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      duration_hours INTEGER CHECK (duration_hours > 0)
    );

    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL
    );

    CREATE TABLE lessons (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT
    );

    CREATE TABLE students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      birth_year INTEGER NOT NULL
    );

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);

  const courses = [
    { title: "JavaScript", description: "Курс по языку программирования JavaScript" },
    { title: "Fastify", description: "Курс по фреймворку Fastify" },
  ];

  for (const course of courses) {
    await db.query("INSERT INTO courses (title, description) VALUES ($1, $2)", [
      course.title,
      course.description,
    ]);
  }

  const categories = [{ title: "Программирование" }, { title: "Дизайн" }];

  for (const category of categories) {
    await db.query("INSERT INTO categories (title) VALUES ($1)", [category.title]);
  }

  const lessons = [
    { title: "Переменные", content: "Как объявлять переменные в JavaScript" },
    { title: "Функции", content: "Как объявлять и вызывать функции" },
  ];

  for (const lesson of lessons) {
    await db.query("INSERT INTO lessons (title, content) VALUES ($1, $2)", [
      lesson.title,
      lesson.content,
    ]);
  }

  const students = [
    { name: "Анна Иванова", email: "anna@example.com", birthYear: 2001 },
    { name: "Борис Петров", email: "boris@example.com", birthYear: 1999 },
  ];

  for (const student of students) {
    await db.query("INSERT INTO students (name, email, birth_year) VALUES ($1, $2, $3)", [
      student.name,
      student.email,
      student.birthYear,
    ]);
  }

  const users = [{ name: "admin", email: "admin@example.com", password: "admin" }];

  for (const user of users) {
    await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [
      user.name,
      user.email,
      user.password,
    ]);
  }

  fastify.decorate("db", db);
  fastify.addHook("onClose", () => db.close());
});
