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
        const deletedTeams = await models.DeletedTeam.findAll();

        // Calculate the time until the next reward can be claimed
        if (req.session.loginUser) {
            const user = await models.User.findByPk(req.session.loginUser.id);
            if (user && user.lastDailyRewardClaimedAt) {
                var currentDate = new Date();
                var lastClaimedAt = new Date(user.lastDailyRewardClaimedAt);
                var diffInMilliseconds = Math.abs(currentDate - lastClaimedAt);
                var totalMillisecondsInADay = 24 * 60 * 60 * 1000;
                var remainingMilliseconds = totalMillisecondsInADay - diffInMilliseconds;
                if (remainingMilliseconds > 0) {
                    var hours = Math.floor(remainingMilliseconds / 36e5);
                    var minutes = Math.floor((remainingMilliseconds % 36e5) / 60000);
                    var seconds = Math.floor((remainingMilliseconds % 60000) / 1000);
                    var timeUntilNextReward = `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
                }
            }
        }

        const teamInd = 'teams/index.ejs';
        res.render(teamInd, {teams, deletedTeams, timeUntilNextReward});
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

         // Calcular la suma total de los tokens
         const totalTokens = teamMembers.reduce((sum, member) => sum + member.tokens, 0);

        res.render('teams/show', { team, teamMembers, adminUser, isMember, totalTokens }); 
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
{   
    const team = req.load.team;
    const attachment = team.attachment;
    try {
        // Crear una nueva entrada en DeletedTeams
        await models.DeletedTeam.create({
            id: team.id,
            title: team.title,
            body: team.body,
            tokens: team.tokens,
            numUsers: team.numUsers,
            adminTeamId: team.adminTeamId,
            deletedAt: new Date(),
            deletedBy: req.session.loginUser.username
        });

        // Eliminar todas las entradas en UserTeam que tienen el teamId del equipo que se está eliminando
        await models.UserTeam.destroy({
            where: {
                teamId: team.id
            }
        });

        // Buscar todos los posts con el TeamId del equipo
        const posts = await models.Post.findAll({
            where: {
                TeamId: team.id
            }
        });

        // Eliminar cada post
        for (const post of posts) {
            const originalAttachment = await post.getAttachment();
            let newAttachmentId = null;
            if (originalAttachment) {
                const newAttachment = await models.Attachment.create({
                    mime: originalAttachment.mime,
                    image: originalAttachment.image,
                    url: originalAttachment.url
                });
                newAttachmentId = newAttachment.id;
            }

            await models.DeletedPost.create({
                id: post.id,
                title: post.title,
                body: post.body,
                attachmentId: newAttachmentId, 
                deletedAt: new Date(),
                deletedBy: req.session.loginUser.username, 
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            });

            await models.UserPostVotes.destroy({ where: { postId: post.id } });

            if (post.attachmentId) {
                await models.Attachment.destroy({ where: { id: post.attachmentId } });
            }

            await post.destroy();
        }

        // Ahora eliminar el equipo
        await team.destroy();
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

exports.adminOrAuthorOrTeamAdminRequired = (req, res, next) => 
    {   
        const {team} = req.load;
        const isAdmin = !!req.session.loginUser?.isAdmin;
        const isAuthor = team.authorId === req.session.loginUser?.id;
        const isTeamAdmin = !!req.session.loginUser?.isAdminTeam;
        if(isAdmin || isAuthor || isTeamAdmin){
            next();
        } else{     
            res.send(403);
        }
    };

exports.adminOrTeamAdminRequired = (req, res, next) => 
    {   
        const isAdmin = !!req.session.loginUser?.isAdmin;
        const isTeamAdmin = !!req.session.loginUser?.isAdminTeam;
        if(isAdmin || isTeamAdmin){
            next();
        } else{     
            res.send(403);
        }
    };

exports.joinTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { loginUser } = req.session; 

        // Verificar si el usuario ya estuvo unido al equipo
        const userTeamHistory = await models.UserTeamHistory.findOne({ 
            where: { userId: loginUser.id, teamId }
        });

        if (userTeamHistory) {
            // Si el usuario ya estuvo unido al equipo, restaurar su estado anterior
            await models.UserTeam.create(userTeamHistory.dataValues);
            await models.UserTeamHistory.destroy({ where: { userId: loginUser.id, teamId } });
        } else {
            // Crear una nueva entrada en userTeams para registrar la unión del usuario al equipo
            await models.UserTeam.create({ 
                userId: loginUser.id,
                teamId,
                tokens: 5,
                wallet: 10,
                reputation: 0
            });
        }
        // Incrementar el contador de numUsers en la tabla de Teams
        await models.Team.increment('numUsers', { where: { id: teamId } });

        await new Promise(resolve => setTimeout(resolve, 250));

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

        // Obtener la asociación del usuario con el equipo
        const userTeam = await models.UserTeam.findOne({
            where: { userId: loginUser.id, teamId }
        });

        // Obtener los votos del usuario
        const userVotes = await models.UserPostVotes.findAll({
            where: { userId: loginUser.id }
        });

        // Para cada voto del usuario, verificar si el post pertenece al equipo que está abandonando
        for (let vote of userVotes) {
            const post = await models.Post.findOne({ where: { id: vote.postId } });


            if (post && String(post.TeamId) === String(teamId)) {
                const currentDate = new Date();
                const isVotingPeriod = currentDate >= post.votingStartDate && currentDate <= post.votingEndDate;

                // Solo realizar operaciones de devolución de votos y puntos si el post está en el período de votación
                if (isVotingPeriod) {
                    // Decrementar el conteo de votos en el Post correspondiente
                    await post.decrement('usersVoted');

                    // Restar los puntos de votación del usuario en el Post
                    if (vote.lastVote === 'for') {
                        post.votesFor -= vote.lastVotePoints;
                    } else if (vote.lastVote === 'against') {
                        post.votesAgainst -= vote.lastVotePoints;
                    } else if (vote.lastVote === 'abstain') {
                        post.abstentions -= vote.lastVotePoints;
                    }

                    await post.save();

                    // Devolver los originalVotePoints al wallet del usuario
                    await models.UserTeam.increment('wallet', { by: Math.round(vote.originalVotePoints), where: { userId: loginUser.id, teamId } });
                    
                    // Eliminar el voto del usuario en el post del equipo
                    await models.UserPostVotes.destroy({ where: { userId: loginUser.id, postId: vote.postId } });
                }
            }
        }

        // Actualizar userTeam con los datos más recientes antes de moverlo a UserTeamHistory
        const updatedUserTeam = await models.UserTeam.findOne({
            where: { userId: loginUser.id, teamId }
        });

        // Mover la asociación del usuario con el equipo a UserTeamHistory
        await models.UserTeamHistory.create(updatedUserTeam.dataValues);
        await models.UserTeam.destroy({ where: { userId: loginUser.id, teamId } });

        // Restar un punto a la columna numUsers en la tabla Teams
        await models.Team.decrement('numUsers', { where: { id: teamId } });

        await new Promise(resolve => setTimeout(resolve, 250));

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

exports.inflate = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const userTeams = await models.UserTeam.findAll({
            where: { teamId }
        });

        for (let userTeam of userTeams) {
            if (userTeam.tokens > 0) {
                userTeam.tokens = Math.max(0, Math.round(userTeam.tokens / 2));
                await userTeam.save();
            }
        }

        res.redirect(`/teams/${teamId}`);
    } catch (error) {
        next(error);
    }
};

exports.claimDailyReward = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await models.User.findOne({ where: { id: userId } });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/teams');
        }

        const currentDate = new Date();
        const lastClaimedAt = new Date(user.lastDailyRewardClaimedAt);
        const diffInHours = Math.abs(currentDate - lastClaimedAt) / 36e5;

        if (diffInHours < 24) {
            req.flash('error', 'Daily reward already claimed');
            return res.redirect('/teams');
        }

        await models.UserTeam.increment('wallet', { by: 1, where: { userId: userId } });
        await models.User.update({ lastDailyRewardClaimedAt: currentDate }, { where: { id: userId } });

        // Recarga la instancia del modelo para obtener los datos más recientes
        user = await user.reload();

        req.flash('success', 'Daily reward claimed successfully');
        res.redirect('/teams');
    } catch (error) {
        console.error('Error al ejecutar claimDailyReward:', error);
        req.flash('error', 'An error occurred while claiming daily reward');
        res.redirect('/teams');
    }
};


