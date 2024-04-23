// @ts-check

import yup from 'yup';

export default (app, db) => {
  // Просмотр списка курсов
  app.get('/courses', { name: 'courses' }, (req, res) => {
    db.all('SELECT * FROM courses', (error, data) => {
      if (error) {
        req.flash('warning', 'Ошибка получения списка курсов');
        res.render('index');
        return;
      }
      const templateData = {
        courses: data,
        flash: res.flash(),
      };
      res.view('courses/index.pug', templateData);
    });
  });

  // Форма создания нового курса
  app.get('/courses/new', { name: 'newCourse' }, (req, res) => res.view('courses/new.pug'));

  // Просмотр конкретного курса
  app.get('/courses/:id', { name: 'course' },  (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Ошибка получения списка пользователей');
        res.render('index', { flash: res.flash() });
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      res.view('courses/show', templateData);
    });
  });

  // Создание курса
  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const { title, description } = req.body;

    if (req.validationError) {
      req.flash('warning', req.validationError);
      const data = {
        title, description,
        flash: res.flash(),
      };
  
      res.view('courses/new', data);
      return;
    }
  
    const course = {
      title,
      description,
    };
  
    const stmt = db.prepare('INSERT INTO courses(title, description) VALUES(?, ?)');
    stmt.run([course.title, course.description], (err) => {
      if (err) {
        req.flash('warning', 'Ошибка создания курса');
        res.redirect('/courses/new');
        return;
      }
      req.flash('success', 'Курс успешно создан');
      res.redirect('/courses');
    });
  });

  // Форма редактирования курса
  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Курс не найден');
        res.redirect('/courses');
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      res.view('courses/edit', templateData);
    });
  });

  // Обновление курса
  app.patch('/courses/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
  
    if (req.validationError) {
      req.flash('warning', req.validationError);
      const data = {
        title, description,
        flash: res.flash(),
      };

      res.view('courses/new', data);
      return;
    }
  
    const course = {
      title,
      description,
    };
  
    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?');
    stmt.run([course.title, course.description, id], (err) => {
      if (err) {
        req.flash('warning', 'Ошибка редактирования курса');
        res.redirect(`/courses/${id}`);
        return;
      }
      req.flash('success', 'Курс успешно отредактирован');
      res.redirect('/courses');
    });
  });

  // Удаление курса
  app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    stmt.run(id, (err) => {
      if (err) {
        req.flash('warning', 'Ошибка удаления курса');
        res.redirect(`/courses/${id}`);
        return;
      }
      req.flash('success', 'Курс успешно удален');
      res.redirect('/courses');
    });
  });
};
