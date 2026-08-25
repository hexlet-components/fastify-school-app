# JS Fastify Example

[![Node CI](https://github.com/hexlet-components/fastify-school-app/actions/workflows/nodeci.yml/badge.svg)](https://github.com/hexlet-components/fastify-school-app/actions/workflows/nodeci.yml)

## Зачем это нужно

Учебное приложение на [Fastify](https://fastify.dev/): курсы, уроки и запись
студентов. Сделано как самостоятельная работа курса по Fastify, поэтому
показывает не библиотеку по отдельности, а собранный из них проект: маршруты,
шаблоны, валидация формы, работа с базой.

## Requirement

- NodeJS v26

## Структура

Проект собран утилитой `fastify-cli`, поэтому раскладка у него стандартная.

```text
app.js        точка входа: подключает plugins и routes через @fastify/autoload
plugins/      расширения приложения: база данных, шаблонизатор, сессия, флеш
routes/       обработчики запросов, по файлу на сущность
views/        шаблоны eta
test/         тесты, приложение поднимается через fastify-cli/helper
```

База данных это PostgreSQL, но поднимается она внутри процесса через
[PGlite](https://pglite.dev/) — тот же postgres, собранный в WebAssembly. Демо
запускается одной командой, без сервера базы рядом, и при этом говорит с той же
СУБД, что курс и учебные проекты. Запросы поэтому асинхронные, значения
подставляются метками `$1`, а строки лежат в поле `rows`.

Сервер поднимает `fastify start`, поэтому в коде приложения нет ни создания
объекта Fastify, ни вызова `listen()`. Опции приложения (логгер, отключение
авто-HEAD, подмена метода формы) лежат в экспорте `options` файла _app.js_ и
применяются флагом `--options`, который прописан в командах запуска.

## Commands

```bash
make install
make dev
make test
make lint
```

---

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io?utm_source=github&utm_medium=link&utm_campaign=fastify-school-app)

This repository is created and maintained by the team and the community of Hexlet, an educational project. [Read more about Hexlet](https://hexlet.io?utm_source=github&utm_medium=link&utm_campaign=fastify-school-app).

See most active contributors on [hexlet-friends](https://friends.hexlet.io/).
