// @ts-check

import courses from './courses.js'
import users from './users.js'
import root from './root.js'

const controllers = [
  courses,
  users,
  root,
]

/**
 * @param {any} app - Экземпляр Fastify
 * @param {any} db - База данных SQLite
 */

export default (app, db) => controllers.forEach(f => f(app, db))
