const Sequelize = require("sequelize");
const {models} = require("../models" ) ;
const { Op } = require('sequelize');

exports.load = async (req, res, next, postId) => 
{   try { const post = await models.Post.findByPk(postId, {
            include: [ {model: models.Attachment, as: 'attachment'},
            {model: models.User, as: 'author'},
            { model: models.Team, as: 'team' } ]
        });
        if (post) {
            req.load = {...req.load, post};
            next();}   
        else {
            throw new Error ( 'No existe el post con el id=' + postId ) ;
        }
    } catch (error) {next(error);}
};

exports.attachment = (req, res, next) => {
    const {post} = req.load;
    const {attachment} = post ;
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
        const allFindOptions = models.Post.findAll(findOptions);
        const posts = await allFindOptions;
        const deletedPosts = await models.DeletedPost.findAll({
            include: [
                {
                    model: models.Attachment,
                    as: 'attachment'
                }
            ]
        });

        const postInd = 'posts/index.ejs';
        res.render(postInd, {posts, deletedPosts, filterType: ''});
    } 
    catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    const { post } = req.load;
    const isLoggedIn = req.session.loginUser;
    if (post) {
        try {
            let teamName = 'No team assigned';
            if (post.TeamId) {
                const team = await models.Team.findByPk(post.TeamId);
                if (team) {
                    teamName = team.title;
                }
            }
            const userId = req.session.loginUser ? req.session.loginUser.id : null;
            const userPostVote = await models.UserPostVotes.findOne({
                where: {
                    postId: post.id,
                    userId: userId,
                },
            });
            const userTeams = await models.UserTeam.findAll({
                where: { userId: userId },
                attributes: ['teamId', 'wallet']
            });
            const belongsToSameTeam = userTeams.some(team => team.teamId === post.TeamId);

            const userTeam = await models.UserTeam.findOne({
                where: { userId: userId, teamId: post.TeamId },
            });
            const userTeamReputation = userTeam ? userTeam.reputation || 0 : 0;
            const reputationFactor = 1 + (userTeamReputation / 100);

            const isAdmin = req.session.loginUser ? req.session.loginUser.isAdmin : false;
            const currentDate = new Date();
            const isVotingPeriod = currentDate >= post.votingStartDate && currentDate <= post.votingEndDate;
            const isVetoEnabled = currentDate < post.vetoDate;
            const isPostVotingFinished = currentDate > post.votingEndDate;
            const userWalletPoints = userTeams.find(team => team.teamId === post.TeamId)?.wallet || 0;
            const formattedPost = {
                ...post.toJSON(),
                votingStartDate: post.votingStartDate ? new Date(post.votingStartDate).toLocaleString() : 'No especificada',
                votingEndDate: post.votingEndDate ? new Date(post.votingEndDate).toLocaleString() : 'No especificada',
                applicationDate: post.applicationDate ? new Date(post.applicationDate).toLocaleString() : 'No especificada',
                vetoDate: post.vetoDate ? new Date(post.vetoDate).toLocaleString() : 'No especificada',
                team: teamName,
                hasVoted: userPostVote && userPostVote.hasVoted,
                userWalletPoints: userWalletPoints,
                userTeamReputation: userTeamReputation,
                reputationFactor: reputationFactor
            };
            res.render('posts/show', { post: formattedPost, isAdmin, isVotingPeriod, isVetoEnabled, belongsToSameTeam, isLoggedIn, isPostVotingFinished });
        } catch (error) {
            next(error);
        }
    } else {
        next(new Error('El post no existe'));
    }
};

exports.new = async (req, res, next) => {
    try {
        const teams = await models.Team.findAll();
        const post = {
            title: "",
            body: ""
        };
        res.render("posts/new", { post, teams }); 
    } catch (error) {
        next(error);
    }
};


exports.create = async (req, res, next) => 
{   const { title, body, team, votingStartDate, votingEndDate, applicationDate, vetoDate, min_voting, max_voting, min_users_voted, voting_reward, voting_failure_penalty, voting_success_reward } = req.body;
    const authorId = req.session.loginUser?.id;
    let post;
    try {

        const convertedStartDate = new Date(votingStartDate);
        const convertedEndDate = new Date(votingEndDate);
        const convertedApplicationDate = new Date(applicationDate);
        const convertedVetoDate = new Date(vetoDate);

        post = models.Post.build({
            title,
            body,
            authorId,
            votingStartDate: convertedStartDate,
            votingEndDate: convertedEndDate,
            applicationDate: convertedApplicationDate,
            vetoDate: convertedVetoDate,
            min_voting,
            max_voting,
            min_users_voted,
            voting_reward,
            voting_failure_penalty,
            voting_success_reward
        });
        const savedPost = await post.save();
        await savedPost.setTeam(team);
        const saveFields = post.save({fields: ["title", "body", "authorId", "votingStartDate", "votingEndDate", "applicationDate", "vetoDate"]});
        post = await saveFields;
        try {
            if (!req.file) { return;  }
            await createPostAttachment(req, post) ;
        } catch (error) { next(error); } 
        finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            const postsN = 'posts/new';
            res.render(postsN, {post});
        } else {next(error);  } 
    }
};

const createPostAttachment = async (req, post) => 
{   const image = req.file.buffer.toString('base64');
    const url = `${req.protocol}://${req.get('host')}/posts/${post.id}/attachment`;    
    const attachment = await models.Attachment.create(   
        {
        mime: req.file.mimetype,
        image,
        url
    });
    await post.setAttachment(attachment);
};


exports.edit = async (req, res, next) => {
    try {
        const teams = await models.Team.findAll(); 
        const { post } = req.load;
        const formattedPost = {
            ...post.toJSON(),
            votingStartDate: post.votingStartDate ? new Date(post.votingStartDate).toISOString().slice(0,16) : '', 
            votingEndDate: post.votingEndDate ? new Date(post.votingEndDate).toISOString().slice(0,16) : '', 
            applicationDate: post.applicationDate ? new Date(post.applicationDate).toISOString().slice(0,16) : '',
            vetoDate: post.vetoDate ? new Date(post.vetoDate).toISOString().slice(0,16) : '',
        };
        res.render('posts/edit', { ...req.load, teams, post: formattedPost });
    } catch (error) {
        next(error);
    }
};


exports.update = async (req, res, next) => {
    const { post } = req.load;

    if (!req.body.title || !req.body.body || !req.body.votingStartDate || !req.body.votingEndDate || !req.body.applicationDate || !req.body.vetoDate) {
        return res.status(400).send('Por favor, rellena todos los campos obligatorios.');
    }

    post.title = req.body.title;
    post.body = req.body.body;
    post.votingStartDate = new Date(req.body.votingStartDate);
    post.votingEndDate = new Date(req.body.votingEndDate);
    post.applicationDate = new Date(req.body.applicationDate);
    post.vetoDate = new Date(req.body.vetoDate);
    post.min_voting = req.body.min_voting;
    post.max_voting = req.body.max_voting;
    post.min_users_voted = req.body.min_users_voted;
    post.voting_reward = req.body.voting_reward;
    post.voting_failure_penalty = req.body.voting_failure_penalty;
    post.voting_success_reward = req.body.voting_success_reward;

    try {
        const updatedPost = await post.save();
        await updatedPost.setTeam(req.body.team); 
        try {
            if (!req.file) {
                return;
            }
            if (post.attachment) {
                await post.attachment.destroy();
                await post.setAttachment();
            }
            await createPostAttachment(req, post);
        } catch (error) {
            next(error);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('There are errors in the form:');
            error.errors.forEach(({ message }) => console.log(message));
            const postsEdit = 'posts/edit';
            res.render(postsEdit, req.load);
        } else {
            next(error);
        }
    }
};

exports.destroy = async (req, res, next) => {
    try {
        const post = req.load.post;
        const originalAttachment = await post.getAttachment();

        const currentDate = new Date();

        // Verifica si la fecha actual está dentro del rango de votingStartDate y votingEndDate
        if (post.votingStartDate <= currentDate && currentDate <= post.votingEndDate) {
            // Devolver los originalVotePoints a cada usuario que votó en la propuesta
            const userPostVotes = await models.UserPostVotes.findAll({
                where: {
                    postId: post.id,
                    hasVoted: true,
                },
            });

            for (const userVote of userPostVotes) {
                const { userId, originalVotePoints } = userVote;
                const teamId = post.TeamId;

                await models.UserTeam.increment('wallet', { by: Math.round(originalVotePoints), where: { userId: userId, teamId: teamId } });
            }
        }

        // Crea un nuevo adjunto con los mismos datos que el original
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

        await req.load.post.destroy();
        res.redirect('/posts');
    } catch (error) {
        next(error);
    }
};

// exports.deletedPostAttachment = async (req, res, next) => {
//     const deletedPost = await models.DeletedPost.findByPk(req.params.postId);
//     const attachment = await deletedPost.getAttachment();
//     if (!attachment) { res.redirect("/images/none.png") ; }
//     else if (attachment.image) {
//         res.type(attachment.mime);
//         const buff = Buffer.from(attachment.image.toString(), 'base64' );
//         res.send( buff);
//     }
//     else if (attachment.url) {     res.redirect(attachment.url) ; }
//     else { 
//         const imgNone = "/images/none.png";
//         res.redirect(imgNone); } 

// };

exports.adminOrAuthorRequired = (req, res, next) => 
{   const {post} = req.load;
    const isAdmin = !!req.session.loginUser?.isAdmin;
    const isAuthor = post.authorId === req.session.loginUser?.id;
    if(isAdmin || isAuthor){
        next();
    } else{     
        res.send(403);
    }
};

exports.vote = async (req, res, next) => {
    const { post } = req.load;
    const { vote, votePoints } = req.body;
    const userId = req.session.loginUser.id;

    try {
        const userTeam = await models.UserTeam.findOne({
            where: { userId: userId, teamId: post.TeamId },
        });

        if (!userTeam || userTeam.wallet < votePoints) {
            return res.status(400).send('No dispone de esa cantidad de puntos en su wallet para votar.');
        }

        const userPostVote = await models.UserPostVotes.findOne({
            where: {
                postId: post.id,
                userId: userId,
            },
        });

        if (userPostVote && userPostVote.hasVoted) {
            return res.status(400).send('Ya has votado en esta propuesta.');
        }

        if (!userPostVote) {
            await post.increment('usersVoted');
        }

        if (parseInt(votePoints) > post.max_voting) {
            return res.status(400).send(`El número de puntos que ha seleccionado votar (${votePoints}) excede el límite máximo permitido. Se permite votar entre ${post.min_voting} y ${post.max_voting} puntos.`);
        }

        if (parseInt(votePoints) < post.min_voting) {
            return res.status(400).send(`El número de puntos que ha seleccionado votar (${votePoints}) es inferior al límite mínimo permitido. Se permite votar entre ${post.min_voting} y ${post.max_voting} puntos.`);
        }

        if (parseInt(votePoints) < post.min_voting && parseInt(votePoints) > post.max_voting){

        }
        const userTeamReputation = userTeam.reputation || 0;
        const reputationFactor = 1 + (userTeamReputation / 100);
        const votePointsWithReputation = Math.round(votePoints * reputationFactor);

        if (!userPostVote) {
            await models.UserPostVotes.create({
                userId: userId,
                postId: post.id,
                hasVoted: true,
                lastVote: vote,
                lastVotePoints: parseInt(votePointsWithReputation), 
                originalVotePoints: parseInt(votePoints)
            });
        } else {
            await userPostVote.update({ hasVoted: true, lastVote: vote, lastVotePoints: parseInt(votePointsWithReputation), originalVotePoints: parseInt(votePoints) }); 
        }

        await models.UserTeam.decrement('wallet', { by: parseInt(votePoints), where: { userId: userId, teamId: post.TeamId } }); 

        if (vote === 'for') {
            post.votesFor += parseInt(votePointsWithReputation); 
        } else if (vote === 'against') {
            post.votesAgainst += parseInt(votePointsWithReputation); 
        } else if (vote === 'abstain') {
            post.abstentions += parseInt(votePointsWithReputation); 
        }

        await post.save();

        res.redirect(`/posts/${post.id}`);
    } catch (error) {
        next(error);
    }
};



exports.changeVote = async (req, res, next) => {
    const { post } = req.load;
    const userId = req.session.loginUser.id;
    const teamId = req.body.teamId; 

    try {
        const userPostVote = await models.UserPostVotes.findOne({
            where: {
                postId: post.id,
                userId: userId,
            },
        });

        if (!userPostVote) {
            res.redirect(`/posts/${post.id}`);
            return;
        }

        const userTeam = await models.UserTeam.findOne({
            where: { userId: userId, teamId: teamId },
        });

        const lastvotedpoints = userPostVote.lastVotePoints;
        const originalVotePoints = userPostVote.originalVotePoints;
        // const userTeamReputation = userTeam ? userTeam.reputation || 0 : 0;
        // const reputationFactor = 1 + (userTeamReputation / 100);
        // const votePointsWithOutReputation = lastvotedpoints / reputationFactor;
        await models.UserTeam.increment('wallet', { by: Math.round(originalVotePoints), where: { userId: userId, teamId: teamId } });
        
        await post.decrement('usersVoted');

        if (userPostVote.lastVote === 'for') {
            post.votesFor -= lastvotedpoints;
        } else if (userPostVote.lastVote === 'against') {
            post.votesAgainst -= lastvotedpoints;
        } else if (userPostVote.lastVote === 'abstain') {
            post.abstentions -= lastvotedpoints;
        }

        await post.save();

        await userPostVote.destroy();

        res.redirect(`/posts/${post.id}`);
    } catch (error) {
        next(error);
    }
};

  
exports.veto = async (req, res, next) => {
    const { post } = req.load;
  
    try {
        const userPostVotes = await models.UserPostVotes.findAll({
            where: {
                postId: post.id,
                hasVoted: true,
            },
        });

        for (const userVote of userPostVotes) {
            const { userId, lastVotePoints } = userVote;
            const teamId = post.TeamId;

            const userTeam = await models.UserTeam.findOne({
                where: { userId: userId, teamId: teamId },
            });

            const originalVotePoints = userVote.originalVotePoints;
            // const userTeamReputation = userTeam ? userTeam.reputation || 0 : 0;
            // const reputationFactor = 1 + (userTeamReputation / 100);
            // const votePointsWithOutReputation = lastVotePoints / reputationFactor;
            await models.UserTeam.increment('wallet', { by: Math.round(originalVotePoints), where: { userId: userId, teamId: teamId } });
        }

        // post.votesFor = 0;
        // post.votesAgainst = 0;
        // post.abstentions = 0;
        post.vetoed = true;
        await post.save();
  
        res.redirect(`/posts/${post.id}`);
    } catch (error) {
        next(error);
    }
};


exports.calculateReputation = async () => {
    try {
        const teams = await models.Team.findAll();

        for (const team of teams) {
            const teamId = team.id;

            const userTeams = await models.UserTeam.findAll({
                where: { teamId: teamId },
            });

            const totalTokens = userTeams.reduce((total, userTeam) => total + userTeam.tokens, 0);

            for (const userTeam of userTeams) {
                const userId = userTeam.userId;
                const userTokens = userTeam.tokens;

                const reputation = totalTokens !== 0 ? Math.round((userTokens / totalTokens) * 100) : 0;

                await models.UserTeam.update({ reputation: reputation }, { where: { userId: userId, teamId: teamId } });
            }
        }

        // res.redirect('/posts');
    } catch (error) {
        console.error('Error al ejecutar calculateReputation:', error);
    }
};

exports.applyRewards = async () => {
    try {
        // Obtener solo las propuestas que aún no han recibido recompensas y no han sido vetadas
        const posts = await models.Post.findAll({
            where: {
                votingRewardGiven: false, // Solo las propuestas que aún no han recibido recompensas
                vetoed: false // Que no han sido vetadas
            }
        });

        for (const post of posts) {
            const currentDate = new Date();
            const votingEndDate = new Date(post.votingEndDate);
            if (currentDate > votingEndDate && !post.vetoed) {
                if (post.usersVoted >= post.min_users_voted){             
                    const userPostVotes = await models.UserPostVotes.findAll({
                        where: {
                            postId: post.id,
                            hasVoted: true,
                        },
                    });

                    const totalPointsVoted = userPostVotes.reduce((total, userVote) => total + userVote.lastVotePoints, 0);

                    if (totalPointsVoted > 0) {
                        const teamId = post.TeamId;
                        const usersWithCorrectVote = [];

                        const votesFor = post.votesFor;
                        const votesAgainst = post.votesAgainst;
                        let winningOption;
                        let losingOption;

                        if (votesFor > votesAgainst) {
                            winningOption = 'for';
                            losingOption = 'against';
                        } else if (votesAgainst > votesFor) {
                            winningOption = 'against';
                            losingOption = 'for';
                        }

                        for (const userPostVote of userPostVotes) {
                            const userId = userPostVote.userId;
                            const vote = userPostVote.lastVote;

                            if (vote === winningOption) {
                                usersWithCorrectVote.push(userId);
                            }
                        }

                        for (const userId of usersWithCorrectVote) {
                            const userTeam = await models.UserTeam.findOne({
                                where: { userId: userId, teamId: teamId },
                            });

                            const userTeamReputation = userTeam ? userTeam.reputation || 0 : 0;
                            const percentage = userTeamReputation / 100;
                            const pointsToDistribute = Math.round(totalPointsVoted * percentage);

                            await models.UserTeam.increment('wallet', { by: pointsToDistribute, where: { userId: userId, teamId: teamId } });
                        }
                    }

                    const teamId = post.TeamId;

                    for (const userPostVote of userPostVotes) {
                        const userId = userPostVote.userId;
                        const votingReward = post.voting_reward;

                        await models.UserTeam.increment('wallet', { by: votingReward, where: { userId: userId, teamId: teamId } });
                    }

                    const votesFor = post.votesFor;
                    const votesAgainst = post.votesAgainst;
                    const abstentions = post.abstentions;
                    let winningOption;
                    let losingOption;
                    if (votesFor > votesAgainst) {
                        winningOption = 'for';
                        losingOption = 'against';
                    } else if (votesAgainst > votesFor) {
                        winningOption = 'against';
                        losingOption = 'for';
                    }

                    for (const userPostVote of userPostVotes) {
                        const userId = userPostVote.userId;
                        const votingFailurePenalty = post.voting_failure_penalty;
                        const votingSuccessReward = post.voting_success_reward;
                        const vote = userPostVote.lastVote;

                        if (vote === winningOption) {
                            await models.UserTeam.increment('tokens', { by: votingSuccessReward, where: { userId: userId, teamId: teamId } });
                        } else if (vote === losingOption) {
                            await models.UserTeam.decrement('tokens', { by: votingFailurePenalty, where: { userId: userId, teamId: teamId } });
                        }
                    }
                // Si no se llega al min_users_voted
                }  else {
                    const userPostVotes = await models.UserPostVotes.findAll({
                        where: {
                            postId: post.id,
                            hasVoted: true,
                        },
                    });
            
                    for (const userVote of userPostVotes) {
                        const { userId, lastVotePoints } = userVote;
                        const teamId = post.TeamId;

                        const userTeam = await models.UserTeam.findOne({
                            where: { userId: userId, teamId: teamId },
                        });

                        const originalVotePoints = userVote.originalVotePoints;
                        // const userTeamReputation = userTeam ? userTeam.reputation || 0 : 0;
                        // const reputationFactor = 1 + (userTeamReputation / 100);
                        // const votePointsWithOutReputation = lastVotePoints / reputationFactor;
                        await models.UserTeam.increment('wallet', { by: Math.round(originalVotePoints), where: { userId: userId, teamId: teamId } });
                    }
                }
                // Al final del bucle for que maneja la aplicación de recompensas
                await models.Post.update({ votingRewardGiven: true }, { where: { id: post.id } });
            }
        }
        // Para calcular o actualizar la reputación después de repartir las recompensas
        await exports.calculateReputation();

        // res.redirect('/posts');
    } catch (error) {
        console.error('Error al ejecutar applyRewards:', error);
    }
};

exports.filter = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const filterType = req.query.filter;

        const allPosts = await models.Post.findAll({
            include: [
                { model: models.Attachment, as: 'attachment' },
                { model: models.User, as: 'author' }
            ],
            order: [['createdAt', 'ASC']]
        });

        const posts = allPosts.filter(post => {
            switch (filterType) {
                case 'not-started':
                    return currentDate < post.votingStartDate;
                case 'in-progress':
                    return currentDate >= post.votingStartDate && currentDate <= post.votingEndDate;
                case 'finished':
                    return currentDate > post.votingEndDate && !post.vetoed;
                case 'vetoed':
                    return post.vetoed;
                case '':
                    return true; // Retorna todas las publicaciones si el filtro es "All"
                default:
                    return false;
            }
        });

        res.render('posts/index', { posts, filterType });
    } catch (error) {
        next(error);
    }
};