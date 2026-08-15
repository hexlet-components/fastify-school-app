# JS Fastify Example

[![main](https://github.com/hexlet-components/fastify-school-app/actions/workflows/main.yml/badge.svg)](https://github.com/hexlet-components/fastify-school-app/actions/workflows/main.yml)

## Зачем это нужно

Учебное приложение на [Fastify](https://fastify.dev/): курсы, уроки и запись
студентов. Сделано как самостоятельная работа курса по Fastify, поэтому
показывает не библиотеку по отдельности, а собранный из них проект: маршруты,
шаблоны, валидация формы, работа с базой.

## Requirement

* NodeJS v24

## Структура

Проект собран утилитой `fastify-cli`, поэтому раскладка у него стандартная.

```text
app.js        точка входа: подключает plugins и routes через @fastify/autoload
plugins/      расширения приложения: база данных, шаблонизатор, сессия, флеш
routes/       обработчики запросов, по файлу на сущность
views/        шаблоны pug
```

Сервер поднимает `fastify start`, поэтому в коде приложения нет ни создания
объекта Fastify, ни вызова `listen()`. Опции приложения (логгер, отключение
авто-HEAD, подмена метода формы) лежат в экспорте `options` файла *app.js* и
применяются флагом `--options`, который прописан в командах запуска.

## Commands

```bash
make install
make dev
```

---

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io?utm_source=github&utm_medium=link&utm_campaign=js-fastify-blog)

This repository is created and maintained by the team and the community of Hexlet, an educational project. [Read more about Hexlet](https://hexlet.io?utm_source=github&utm_medium=link&utm_campaign=js-fastify-blog).

See most active contributors on [hexlet-friends](https://friends.hexlet.io/).
