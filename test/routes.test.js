import { beforeEach, describe, expect, it } from "vitest";
import helper from "fastify-cli/helper.js";

let app;

beforeEach(async () => {
  app = await helper.build(["--options", "-l", "silent", "app.js"], {});
  return () => app.close();
});

const form = (payload) => ({
  headers: { "content-type": "application/x-www-form-urlencoded" },
  payload: new URLSearchParams(payload).toString(),
});

// Сборка стилей проверяется прогоном: её отказ выглядит как успех, потому что
// `main.css` оказывается на месте, а классов из шаблонов в нём нет, и страница
// приходит без оформления.
describe("assets", () => {
  it("отдаёт собранный css с классами из шаблонов", async () => {
    const res = await app.inject({ method: "GET", url: "/assets/main.css" });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain(".max-w-5xl");
    expect(res.payload).toContain(".bg-green-50");
  });
});

describe("courses", () => {
  it("отдаёт список", async () => {
    const res = await app.inject({ method: "GET", url: "/courses" });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain("JavaScript");
  });

  it("отдаёт 404 на несуществующий курс", async () => {
    const res = await app.inject({ method: "GET", url: "/courses/999" });

    expect(res.statusCode).toBe(404);
  });

  it("создаёт курс", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/courses",
      ...form({ title: "Python", description: "Курс по Python" }),
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/courses");

    const list = await app.inject({ method: "GET", url: "/courses" });
    expect(list.payload).toContain("Python");
  });

  it("не создаёт курс с коротким названием", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/courses",
      ...form({ title: "a", description: "" }),
    });

    expect(res.statusCode).toBe(200);

    const list = await app.inject({ method: "GET", url: "/courses" });
    expect(list.payload).not.toContain(">a<");
  });

  it("удаляет курс", async () => {
    const res = await app.inject({ method: "DELETE", url: "/courses/1" });

    expect(res.statusCode).toBe(302);

    const list = await app.inject({ method: "GET", url: "/courses" });
    expect(list.payload).not.toContain("JavaScript");
  });
});

describe("students", () => {
  it("отдаёт список", async () => {
    const res = await app.inject({ method: "GET", url: "/students" });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain("Анна Иванова");
  });

  it("отдаёт 404 на несуществующего студента", async () => {
    const res = await app.inject({ method: "GET", url: "/students/999" });

    expect(res.statusCode).toBe(404);
  });

  it("создаёт студента", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/students",
      ...form({ name: "Виктор Сидоров", email: "viktor@example.com", birthYear: "2000" }),
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/students");

    const list = await app.inject({ method: "GET", url: "/students" });
    expect(list.payload).toContain("viktor@example.com");
  });

  it("не создаёт студента с неверным email или годом", async () => {
    for (const payload of [
      { name: "Виктор Сидоров", email: "not-an-email", birthYear: "2000" },
      { name: "Виктор Сидоров", email: "viktor@example.com", birthYear: "abc" },
    ]) {
      const res = await app.inject({ method: "POST", url: "/students", ...form(payload) });

      expect(res.statusCode).toBe(200);
    }

    const list = await app.inject({ method: "GET", url: "/students" });
    expect(list.payload).not.toContain("viktor@example.com");
    expect(list.payload).not.toContain("not-an-email");
  });

  it("удаляет студента", async () => {
    const res = await app.inject({ method: "DELETE", url: "/students/1" });

    expect(res.statusCode).toBe(302);

    const list = await app.inject({ method: "GET", url: "/students" });
    expect(list.payload).not.toContain("Анна Иванова");
  });
});

describe("users", () => {
  it("отдаёт страницу пользователя", async () => {
    const res = await app.inject({ method: "GET", url: "/users/1" });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toContain("admin@example.com");
  });

  it("не создаёт пользователя с неверным подтверждением пароля", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/users",
      ...form({
        name: "bob",
        email: "bob@example.com",
        password: "secret",
        passwordConfirmation: "other",
      }),
    });

    expect(res.statusCode).toBe(200);

    const list = await app.inject({ method: "GET", url: "/users" });
    expect(list.payload).not.toContain("bob@example.com");
  });
});
