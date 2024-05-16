const { models } = require('../models');

exports.index = async (req, res) => {
  try {
    const users = await models.User.findAll({ attributes: ['id', 'username', 'reputation'] });
    res.render('reputation', { title: 'Reputación', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
};

exports.addPoint = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await models.User.findByPk(userId);
    if (!user) {
      res.status(404).send('Usuario no encontrado');
      return;
    }

    // Incrementar la reputación del usuario
    user.reputation += 1;
    await user.save();

    res.redirect('/reputation'); // Redirigir de vuelta a la página de reputación
  } catch (error) {
    console.error('Error adding point:', error);
    res.status(500).send('Error adding point');
  }
};


exports.adminRequired = (req, res, next) => {
  if(!!req.session.loginUser?.isAdmin){
      next();
  } else{
      res.send(403);
  }
};