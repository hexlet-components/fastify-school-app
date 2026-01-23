// @ts-check

import yup from 'yup'

/**
 * @param {any} app - Экземпляр Fastify
 * @param {any} db - База данных SQLite
 */

export default (app, db) => {
  // Просмотр списка курсов
  app.get('/courses', { name: 'courses' }, (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => {
    const filterOptions = req.query

    const query = filterOptions.title
      ? `SELECT * FROM courses WHERE title LIKE "%${filterOptions.title}%"`
      : 'SELECT * FROM courses'

    db.all(query, (/** @type {any} */ error, /** @type {any} */ data) => {
      if (error) {
        console.error(error)
        req.flash('warning', 'Ошибка получения списка курсов')
        res.redirect(app.reverse('courses'))
        return
      }
      const templateData = {
        courses: data,
        flash: res.flash(),
      }
      res.view('courses/index.pug', templateData)
    })
  })

  // Форма создания нового курса
  app.get('/courses/new', { name: 'newCourse' }, (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => res.view('courses/new.pug'))

  // Просмотр конкретного курса
  app.get('/courses/:id', { name: 'course' }, (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => {
    const { id } = req.params
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (/** @type {any} */ error, /** @type {any} */ data) => {
      if (error) {
        req.flash('warning', 'Ошибка запроса к базе данных')
        res.redirect(app.reverse('courses'))
        return
      }
      if (!data) {
        req.flash('warning', 'Курс не найден')
        res.code(404)
        return
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      }
      console.log('templateData: ', templateData)
      res.view('courses/show', templateData)
    })
  })

  // Создание курса
  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
      }),
    },
    /** @param {any} schema */
    validatorCompiler: ({ schema }) => (/** @type {any} */ data) => {
      try {
        const result = schema.validateSync(data)
        return { value: result }
      }
      catch (e) {
        return { error: e }
      }
    },
  }, (/** @type {any} */ req, /** @type {any} */ res) => {
    const { title, description } = req.body

    if (req.validationError) {
      req.flash('warning', req.validationError)
      const data = {
        title, description,
        flash: res.flash(),
      }

      res.view('courses/new', data)
      return
    }

    const course = {
      title,
      description,
    }

    const stmt = db.prepare('INSERT INTO courses(title, description) VALUES(?, ?)')
    stmt.run([course.title, course.description], (/** @type {any} */ err) => {
      if (err) {
        req.flash('warning', 'Ошибка создания курса')
        res.code(500)
        return
      }
      req.flash('success', 'Курс успешно создан')
      res.redirect(app.reverse('courses'))
    })
  })

  // Форма редактирования курса
  app.get('/courses/:id/edit', { name: 'editCourse' }, (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => {
    const { id } = req.params
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (/** @type {any} */ error, /** @type {any} */ data) => {
      if (error) {
        req.flash('warning', 'Курс не найден')
        res.redirect(app.reverse('courses'))
        return
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      }
      res.view('courses/edit', templateData)
    })
  })

  // Обновление курса
  app.patch('/courses/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
      }),
    },
    /** @param {any} schema */
    validatorCompiler: ({ schema }) => (/** @type {any} */ data) => {
      try {
        const result = schema.validateSync(data)
        return { value: result }
      }
      catch (e) {
        return { error: e }
      }
    },
  }, (/** @type {any} */ req, /** @type {any} */ res) => {
    const { id } = req.params
    const { title, description } = req.body

    if (req.validationError) {
      req.flash('warning', req.validationError)
      const data = {
        title, description,
        flash: res.flash(),
      }

      res.view('courses/new', data)
      return
    }

    const course = {
      title,
      description,
    }

    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?')
    stmt.run([course.title, course.description, id], (/** @type {any} */ err) => {
      if (err) {
        req.flash('warning', 'Ошибка редактирования курса')
        res.code(500)
        return
      }
      req.flash('success', 'Курс успешно отредактирован')
      res.redirect(app.reverse('courses'))
    })
  })

  // Удаление курса
  app.delete('/courses/:id', (
    /** @type {any} */ req,
    /** @type {any} */ res,
  ) => {
    const { id } = req.params
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?')
    stmt.run(id, (/** @type {any} */err) => {
      if (err) {
        req.flash('warning', 'Ошибка удаления курса')
        res.code(500)
        return
      }
      req.flash('success', 'Курс успешно удален')
      res.redirect(app.reverse('courses'))
    })
  })
}
