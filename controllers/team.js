const Sequelize = require("sequelize");
const {models} = require("../models");

exports.load = async (req, res, next, teamId) => 
{   try { const team = await models.Team.findByPk(teamId, {
            include: [ {model: models.Attachment, as: 'attachment'},
            {model: models.User, as: 'author'}]
        });
        if (team) {
            req.load = {...req.load, team};
            next();}   
        else {
            throw new Error ( 'No existe el team con el id=' + teamId ) ;
        }
    } catch (error) {next(error);}
};

exports.attachment = (req, res, next) => {
    const {team} = req.load;
    const {attachment} = team ;
    if (!attachment) { res.redirect("/images/none.png") ; }
    else if (attachment.image) {
        res.type(attachment.mime);
        const buff = Buffer.from(attachment.image.toString(), 'base64' );
        res.send( buff);
    }
    else if (attachment.url) {     res.redirect(attachment.url) ; }
    else { 
        const imgNone = "/images/none.png";
        res.redirect(imgNone); } 
};

exports.index = async (req, res, next) => {
    
    try {
        const findOptions = {
            include: [{model: models.Attachment, as: 'attachment'},
            {model: models.User, as: 'author'}]
        };
        const allFindOptions = models.Team.findAll(findOptions);
        const teams = await allFindOptions;
        const teamInd = 'teams/index.ejs';
        res.render(teamInd, {teams});
    } 
    catch (error) {
        next(error);
    }
};


exports.show = async (req, res, next) => {
    try {
        const { team } = req.load;
        const adminUser = await models.User.findByPk(team.adminTeamId); 
        
        // Verificar si el usuario ha iniciado sesión y si ya es miembro del equipo
        const isMember = req.session.loginUser && await models.UserTeam.findOne({
            where: { userId: req.session.loginUser.id, teamId: team.id }
        });

        // Obtener todos los usuarios que pertenecen al equipo
        const userTeams = await models.UserTeam.findAll({ where: { teamId: team.id } });
        const teamMembers = await Promise.all(userTeams.map(async userTeam => {
            const user = await models.User.findByPk(userTeam.userId);
            return {
                user,
                wallet: userTeam.wallet,
                tokens: userTeam.tokens,
                reputation: userTeam.reputation
            };
        }));

        res.render('teams/show', { team, teamMembers, adminUser, isMember }); 
    } catch (error) {
        next(error);
    }
};



exports.new = async (req, res, next) => {
    try {
        const users = await models.User.findAll(); 
        const team = {
            title: "",
            body: ""
        };
        const teamsNew = 'teams/new';
        res.render(teamsNew, { team, users }); 
    } catch (error) {
        next(error);
    }
};




exports.create = async (req, res, next) => {
    const { title, body, adminUser } = req.body;
    console.log("Datos recibidos del formulario:", req.body); 
    const authorId = req.session.loginUser?.id;
    let team;
    try {
        team = models.Team.build({
            title,
            body,
            authorId,
            adminTeamId: adminUser,
            tokens: 0, 
            numUsers: 0
        });
        const saveFields = team.save({fields: ["title", "body", "authorId", "tokens", "numUsers", "adminTeamId"]});
        team = await saveFields;
        console.log("Equipo creado:", team);
        try {
            if (!req.file) { return;  }
            await createTeamAttachment(req, team) ;
        } catch (error) { next(error); } 
        finally {
            res.redirect('/teams/' + team.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            const teamsN = 'teams/new';
            res.render(teamsN, {team});
        } else {next(error);  } 
    }
};

const createTeamAttachment = async (req, team) => 
{   const image = req.file.buffer.toString('base64');
    const url = `${req.protocol}://${req.get('host')}/teams/${team.id}/attachment`;    
    const attachment = await models.Attachment.create(   
        {
        mime: req.file.mimetype,
        image,
        url
    });
    await team.setAttachment(attachment);
};


exports.edit = async (req, res, next) => {
    try {
        const { team } = req.load;
        const users = await models.User.findAll(); 
        const adminUser = await models.User.findByPk(team.adminTeamId); 
        const teamsEdit = 'teams/edit';
        res.render(teamsEdit, { team, users, adminUser }); 
    } catch (error) {
        next(error);
    }
};


exports.update = async (req, res, next) => 
{   const {team} = req.load;
    team.title = req.body.title;
    team.body = req.body.body;
    team.adminTeamId = req.body.adminUser;
    console.log("Nuevo administrador del equipo:", req.body.adminUser);
    try {
        await team.save({fields: ["title", "body","adminTeamId"]});
        console.log("Equipo actualizado:", team);
        try {
            if (!req.file) {    
                return;
            }
            if (team.attachment) {
                await team.attachment.destroy();
                await team.setAttachment();
            }
            await createTeamAttachment(req, team);
        } catch (error) { next(error);  } 
        finally {
            res.redirect('/teams/' + team.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            const teamsEdit = 'teams/edit';
            res.render(teamsEdit, req.load);
        } else {next(error);  }
    }
};

exports.destroy = async (req, res, next) => 
{   const attachment = req.load.team.attachment;
    try {
        await req.load.team.destroy();
        attachment && await attachment.destroy();
        const teams = '/teams';
        res.redirect(teams);
    } catch (error) { next(error); }
}; 

exports.adminOrAuthorRequired = (req, res, next) => 
{   const {team} = req.load;
    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isAuthor = team.authorId === req.session.loginUser?.id;
    if(isAdmin || isAuthor){
        next();
    } else{     
        res.send(403);
    }
};

exports.joinTeam = async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const { loginUser } = req.session; 
      // Incrementar el contador de numUsers en la tabla de Teams
      await models.Team.increment('numUsers', { where: { id: teamId } });
      // Verificar si el usuario ya está unido al equipo
      const userTeam = await models.UserTeam.findOne({ 
        where: { userId: loginUser.id, teamId }
      });
  
      if (userTeam) {
        // Si el usuario ya está unido al equipo, redireccionar a la página del equipo
        return res.redirect('/teams/' + teamId);
      }
  
      // Crear una nueva entrada en userTeams para registrar la unión del usuario al equipo
      await models.UserTeam.create({ 
        userId: loginUser.id,
        teamId,
        tokens: 5,
        wallet: 10,
        reputation: 0
      });
  
      // Redireccionar a la página del equipo después de unirse exitosamente
      res.redirect('/teams/' + teamId);
    } catch (error) {
      next(error);
    }
  };
  

  exports.leaveTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { loginUser } = req.session;
        
        // Eliminar la asociación del usuario con el equipo
        await models.UserTeam.destroy({
            where: { userId: loginUser.id, teamId }
        });
        // Restar un punto a la columna numUsers en la tabla Teams
        await models.Team.decrement('numUsers', { where: { id: teamId } });
        // Redireccionar a la página del equipo después de abandonar el equipo
        res.redirect('/teams/' + teamId);
    } catch (error) {
        next(error); 
    }
};




exports.donate = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { recipient, amount } = req.body;

        const donorUserTeam = await models.UserTeam.findOne({
            where: { userId: req.session.loginUser.id, teamId }
        });

        const recipientUserTeam = await models.UserTeam.findOne({
            where: { userId: recipient, teamId }
        });

        const donationAmount = Number(amount);

        if (donorUserTeam.wallet < donationAmount) {
            throw new Error('Insufficient tokens');
        }

        donorUserTeam.wallet -= donationAmount;
        recipientUserTeam.wallet += donationAmount;

        await donorUserTeam.save();
        await recipientUserTeam.save();

        res.redirect(`/teams/${teamId}`);
    } catch (error) {
        next(error);
    }
};














// exports.donateReputation = async (req, res, next) => {
//     try {
//         const { team } = req.load;
//         const { recipientUserId, amount } = req.body;
//         const { loginUser } = req.session;

//         // Verificar si el usuario tiene suficientes tokens para donar
//         if (loginUser.tokens < amount) {
//             return res.status(400).send("No tienes suficientes tokens para donar esa cantidad de reputación.");
//         }

//         // Verificar si el usuario receptor pertenece al equipo
//         const recipientUserTeam = await models.UserTeam.findOne({
//             where: { userId: recipientUserId, teamId: team.id }
//         });

//         if (!recipientUserTeam) {
//             return res.status(400).send("El usuario receptor no pertenece a este equipo.");
//         }

//         // Restar la cantidad de tokens donados del usuario donante
//         await models.UserTeam.decrement('tokens', {
//             by: amount,
//             where: { userId: loginUser.id, teamId: team.id }
//         });

//         // Sumar la cantidad de tokens donados al usuario receptor
//         await models.UserTeam.increment('tokens', {
//             by: amount,
//             where: { userId: recipientUserId, teamId: team.id }
//         });

//         res.redirect('/teams/' + team.id);
//     } catch (error) {
//         next(error);
//     }
// };