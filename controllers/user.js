const Sequelize = require("sequelize");
const {models} = require("../models");

exports.load = async (req, res, next, userId) => {
    try {
        const user = await models.User.findByPk(userId);
        if (user) {
            req.load = {...req.load, user};
            next();
        } else {
            console.log('Error: There is no user with id=' + userId + '.');
            throw new Error('No exist userId=' + userId);
        }
    } catch (error) {next(error); }
};

exports.index = async (req, res, next) => {
    try {
        const findOptions = {
            order: ['username']
        };
        const users = await models.User.findAll(findOptions);
        res.render('users/index', {users});
    } catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    const {user} = req.load;

    try {
        const userTeams = await models.UserTeam.findAll({ where: { userId: user.id } });

        // Buscar el título del equipo para cada entrada de UserTeam
        for (let i = 0; i < userTeams.length; i++) {
            const team = await models.Team.findOne({ where: { id: userTeams[i].teamId } });
            console.log('Team:', team); // Verificar que el equipo se está obteniendo correctamente
            userTeams[i] = {...userTeams[i].dataValues, teamTitle: team.title}; // Agregar teamTitle al objeto userTeam
            console.log('UserTeam after adding team title:', userTeams[i]); // Verificar que el título del equipo se está agregando correctamente
        }

        res.render('users/show', {user, userTeams});
    } catch (error) {
        next(error);
    }
};

exports.new = (req, res, next) => {
    const user = {
        username: "",
        password: "",
        email: ""
    };
    res.render('users/new', {user});
};

exports.create = async (req, res, next) => {
    const {username, password, email} = req.body;
    let user = models.User.build({
        username,
        password,
        email
    });
    if (!password) {
        console.log('Error: Password must not be empty.');
        return res.render('users/registrarse', {user});
    }
    try {user = await user.save({fields: ["username", "password", "salt", "email"]});
        console.log('Success: User created successfully.');
        if (req.session.loginUser) {
            res.redirect('/users/' + user.id);
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            console.log(`Error: User "${username}" already exists.`);
            res.render('users/registrarse', {user});
        } else if (error instanceof Sequelize.ValidationError) {
            console.log('Error: There are errors in the form:');
            error.errors.forEach(({message}) => console.log('Error:', message));
            res.render('users/registrarse', {user});
        } else {
            next(error);
        }
    }
};

// exports.edit = (req, res, next) => {
//     const {user} = req.load;
//     res.render('users/edit', {user});
// };

exports.edit = (req, res, next) => {
    const { user } = req.load;
    const previousPage = req.headers.referer.includes("/users/") ? req.headers.referer.split("/").pop() : null;
    res.render('users/edit', { user, previousPage });
};

// exports.update = async (req, res, next) => {
//     const {body} = req;
//     const {user} = req.load;
//     user.username = body.username;
//     user.email = body.email;
//     let fields_to_update = ["username", "email"];
//     if (body.password) {
//         console.log('Updating password');
//         user.password = body.password;
//         fields_to_update.push('salt');
//         fields_to_update.push('password');
//     }
//     try {
//         await user.save({fields: fields_to_update});
//         console.log('Success: User updated successfully.');
//         res.redirect('/users/' + user.id);
//     } catch (error) {
//         if (error instanceof Sequelize.ValidationError) {
//             console.log('Error: There are errors in the form:');
//             error.errors.forEach(({message}) => console.log('Error:', message));
//             res.render('users/edit', {user});
//         } else {
//             next(error);
//         }
//     }
// };

exports.update = async (req, res, next) => {
    const { body } = req;
    const { user } = req.load;
    user.username = body.username;
    user.email = body.email;
    user.isAdmin = !!body.isAdmin; // Convierte a booleano
    user.isAdminProposal = !!body.isAdminProposal;
    user.isAdminTeam = !!body.isAdminTeam;
    user.isAdminToken = !!body.isAdminToken;
    
    let fields_to_update = ["username", "email", "isAdmin", "isAdminProposal", "isAdminTeam", "isAdminToken"];
    if (body.password) {
        console.log('Updating password');
        user.password = body.password;
        fields_to_update.push('salt');
        fields_to_update.push('password');
    }
    
    try {
        await user.save({ fields: fields_to_update });
        console.log('Success: User updated successfully.');
        res.redirect('/users/' + user.id);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            console.log('Error: There are errors in the form:');
            error.errors.forEach(({ message }) => console.log('Error:', message));
            res.render('users/edit', { user });
        } else {
            next(error);
        }
    }
};

// exports.destroy = async (req, res, next) => {
//     try {
//         if (req.session.loginUser?.id === req.load.user.id) {
//             delete req.session.loginUser;
//         }
//         await req.load.user.destroy()
//         console.log('Success: User deleted successfully.');
//         res.redirect('/users');
//     } catch (error) {
//         next(error);
//     }
// };

exports.destroy = async (req, res, next) => {
    try {
        const { userId } = req.params; // ID del usuario a eliminar

        // Obtener los votos del usuario
        const userVotes = await models.UserPostVotes.findAll({
            where: { userId: userId }
        });

        // Para cada voto del usuario
        for (let vote of userVotes) {
            const post = await models.Post.findOne({ where: { id: vote.postId } });

            if (post) {
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

                    // Eliminar el voto del usuario en el post del equipo
                    await models.UserPostVotes.destroy({ where: { userId: userId, postId: vote.postId } });
                } else {
                    // Eliminar el voto del usuario en el post del equipo
                    await models.UserPostVotes.destroy({ where: { userId: userId, postId: vote.postId } });
                }
            }
        }

        // Obtener los equipos del usuario
        const userTeams = await models.UserTeam.findAll({
            where: { userId: userId }
        });

        // Para cada equipo del usuario
        for (let userTeam of userTeams) {
            const team = await models.Team.findOne({ where: { id: userTeam.teamId } });

            if (team) {
                // Decrementar el conteo de usuarios en el equipo correspondiente
                await team.decrement('numUsers');

                // Eliminar la entrada del usuario en el equipo
                await models.UserTeam.destroy({ where: { userId: userId, teamId: userTeam.teamId } });
            }
        }

        if (req.session.loginUser?.id === parseInt(userId)) {
            delete req.session.loginUser;
            await req.load.user.destroy()
            console.log('Success: User deleted successfully.');
            res.redirect('/registrarse');
        } else {
            await req.load.user.destroy()
            console.log('Success: User deleted successfully.');
            res.redirect('/users');
        }
    } catch (error) {
        next(error);
    }
};

exports.registrarse = function(req, res, next) {
    res.render('users/registrarse', { user: models.User.build() });
};