// @ts-check

import yup from 'yup';

export default (app, db) => {
  // Просмотр списка пользователей
  app.get('/users', { name: 'users' }, (req, res) => {
    db.all('SELECT * FROM users', (error, data) => {
      if (error) {
        req.flash('warning', 'Ошибка получения списка пользователей');
        res.code(500);
        return;
      }
      const templateData = {
        users: data,
        flash: res.flash(),
      };
      res.view('users/index.pug', templateData);
    });
  });

  // Просмотр конкретного пользователя
  app.get('/users/:id', { name: 'user' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Ошибка');
        res.code(500);
        res.render('index', { flash: res.flash() });
        return;
      }
      if (!data) {
        req.flash('warning', 'Пользователь не найден');
        res.code(404);
        return;
      }
      const templateData = {
        user: data,
        flash: res.flash(),
      };
      res.view('users/show', templateData);
    });
  });

  // Форма создания нового пользователя
  app.get('/users/new', { name: 'newUser' }, (req, res) => {
    const templateData = {
      flash: res.flash(),
    };
    res.view('users/new.pug', templateData);
  });

  // Создание пользователя
  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2),
        email: yup.string().email(),
        password: yup.string().min(5),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;
  
    if (req.validationError) {
      req.flash('warning', req.validationError);
      const data = {
        name, email, password, passwordConfirmation,
        flash: res.flash(),
      };
  
      res.view('users/new', data);
      return;
    }
  
    const user = {
      name,
      email,
      password,
    };
  
    const stmt = db.prepare('INSERT INTO users(name, email, password) VALUES(?, ?, ?)');
    stmt.run([user.name, user.email, user.password], (err) => {
      if (err) {
        req.flash('warning', 'Ошибка создания пользователя');
        res.code(500);
        return;
      }
      res.redirect(app.reverse('users'));
    });
  });

  // Форма редактирования пользователя
  app.get('/users/:id/edit', { name: 'editUser' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ${id}`, (error, data) => {
      if (error) {
        req.flash('warning', 'Ошибка');
        res.code(500);
        return;
      }
      if (!data) {
        req.flash('warning', 'Пользователь не найден');
        res.code(404);
        return;
      }
      const templateData = {
        user: data,
        flash: res.flash(),
      };
      res.view('users/edit', templateData);
    });
  });

  // Обновление пользователя
  app.patch('/users/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2),
        email: yup.string().email(),
        password: yup.string().min(5),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation is not equal the password'),
        };
      }
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  }, (req, res) => {
    const { id } = req.params;
    const { name, email, password, passwordConfirmation } = req.body;
  
    if (req.validationError) {
      req.flash('warning', req.validationError);
      const data = {
        name, email, password, passwordConfirmation,
        flash: res.flash(),
      };

      res.view('users/new', data);
      return;
    }
  
    const user = {
      name,
      email,
      password,
    };
  
    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
    stmt.run([user.name, user.email, user.password, id], (err) => {
      if (err) {
        req.flash('warning', 'Ошибка редактирования пользователя');
        res.code(500);
        return;
      }
      req.flash('success', 'Пользователь успешно отредактирован');
      res.redirect(app.reverse('users'));
    });
  });

  // Удаление пользователя
  app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id, (err) => {
      if (err) {
        req.flash('warning', 'Ошибка удаления пользователя');
        res.code(500);
        return;
      }
      req.flash('success', 'Пользователь успешно удален');
      res.redirect(app.reverse('users'));
      return;
    });
  });
};
