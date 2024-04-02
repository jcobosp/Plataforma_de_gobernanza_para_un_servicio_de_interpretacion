const { models } = require('../models');


exports.index = async (req, res) => {
  try {
    const usersWithWallet = await models.UserTeam.findAll({ attributes: ['userId', 'teamId', 'wallet'] });
    const usersWithUsername = [];
    for (const user of usersWithWallet) {
      const userInfo = await models.User.findByPk(user.userId);
      if (userInfo) {
        usersWithUsername.push({ 
          userId: user.userId,
          teamId: user.teamId,
          username: userInfo.username, 
          wallet: user.wallet 
        });
      }
    }
    res.render('wallet', { title: 'Wallet', users: usersWithUsername });
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

exports.addWalletPoint = async (req, res) => {
  const userId = req.params.userId;
  const teamId = req.params.teamId;
  const pointsToAdd = parseInt(req.body.points);

  try {
    const userTeam = await models.UserTeam.findOne({ where: { userId: userId, teamId: teamId } });
    if (!userTeam) {
      res.status(404).send('Usuario no encontrado en el equipo');
      return;
    }

    userTeam.wallet += pointsToAdd;
    await userTeam.save();

    res.redirect('/wallet');
  } catch (error) {
    console.error('Error adding wallet points:', error);
    res.status(500).send('Error adding wallet points');
  }
};

exports.removeWalletPoint = async (req, res) => {
  const userId = req.params.userId;
  const teamId = req.params.teamId;
  const pointsToRemove = parseInt(req.body.points);

  try {
    const userTeam = await models.UserTeam.findOne({ where: { userId: userId, teamId: teamId } });
    if (!userTeam) {
      res.status(404).send('Usuario no encontrado en el equipo');
      return;
    }

    if (userTeam.wallet >= pointsToRemove) {
      userTeam.wallet -= pointsToRemove;
      await userTeam.save();
    } else {
      res.status(400).send('No hay suficientes puntos en el wallet para eliminar');
      return;
    }

    res.redirect('/wallet');
  } catch (error) {
    console.error('Error removing wallet points:', error);
    res.status(500).send('Error removing wallet points');
  }
};
