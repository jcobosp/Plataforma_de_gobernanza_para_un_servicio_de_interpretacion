const { models } = require('../models');

exports.index = async (req, res) => {
  try {
    const users = await models.User.findAll({ attributes: ['id', 'username', 'tokens'] });
    res.render('tokens', { title: 'Tokens', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
};

exports.addToken = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await models.User.findByPk(userId);
    if (!user) {
      res.status(404).send('Usuario no encontrado');
      return;
    }

    // Incrementar los tokens del usuario
    user.tokens += 1;
    await user.save();

    res.redirect('/tokens'); // Redirigir de vuelta a la página de tokens
  } catch (error) {
    console.error('Error adding token:', error);
    res.status(500).send('Error adding token');
  }
};

exports.removeToken = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await models.User.findByPk(userId);
    if (!user) {
      res.status(404).send('Usuario no encontrado');
      return;
    }

    // Decrementar los tokens del usuario si hay suficientes
    if (user.tokens > 0) {
      user.tokens -= 1;
      await user.save();
    } else {
      res.status(400).send('No hay suficientes tokens para eliminar');
      return;
    }

    res.redirect('/tokens'); // Redirigir de vuelta a la página de tokens
  } catch (error) {
    console.error('Error removing token:', error);
    res.status(500).send('Error removing token');
  }
};
