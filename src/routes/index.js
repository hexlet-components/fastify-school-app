// @ts-check

import courses from './courses.js';
import users from './users.js';
import root from './root.js';

const controllers = [
  courses,
  users,
  root,
];

export default (app, db) => controllers.forEach((f) => f(app, db));
