// @ts-check

import yup from 'yup';

export default (app, db) => {
  // Просмотр списка курсов
  app.get('/courses', { name: 'courses' }, (req, res) => {
    const filterOptions = req.query;

    const query = filterOptions.title ? `SELECT * FROM courses WHERE title LIKE "%${filterOptions.title}%"` :
      'SELECT * FROM courses';

    db.all(query, (error, data) => {
      if (error) {
        console.error(error);
        req.flash('warning', 'Ошибка получения списка курсов');
        res.redirect(app.reverse('courses'));
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
        req.flash('warning', 'Ошибка запроса к базе данных');
        res.redirect(app.reverse('courses'));        
        return;
      }
      if (!data) {
        req.flash('warning', 'Курс не найден');
        res.code(404);
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      console.log('templateData: ', templateData);
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
    return new Promise((resolve, reject) => {
      stmt.run([course.title, course.description], (err) => {
        if (err) {
          req.flash('warning', 'Ошибка создания курса');
          res.redirect(app.reverse('newCourse'));
          reject();
        }
        req.flash('success', 'Курс успешно создан');
        res.code(201);
        res.redirect(app.reverse('courses'));
        resolve(true);
      });
    });
  });

  // Форма редактирования курса
  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Курс не найден');
        res.redirect(app.reverse('courses'));
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
    return new Promise(() => {
      stmt.run([course.title, course.description, id], (err) => {
        if (err) {
          req.flash('warning', 'Ошибка редактирования курса');
          res.redirect(app.reverse('course', { id }));
          return;
        }
        req.flash('success', 'Курс успешно отредактирован');
        res.redirect(app.reverse('courses'));
      });
    });
  });

  // Удаление курса
  app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run(id, (err) => {
        if (err) {
          req.flash('warning', 'Ошибка удаления курса');
          res.redirect(app.reverse('course', { id }));
          reject();
        }
        req.flash('success', 'Курс успешно удален');
        res.redirect(app.reverse('courses'));
        resolve(true);
      });
    });
  });
};
