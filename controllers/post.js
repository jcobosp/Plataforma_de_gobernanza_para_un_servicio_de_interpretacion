const Sequelize = require("sequelize");
const {models} = require("../models" ) ;

exports.load = async (req, res, next, postId) => 
{   try { const post = await models.Post.findByPk(postId, {
            include: [ {model: models.Attachment, as: 'attachment'},
            {model: models.User, as: 'author'}]
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
        const postInd = 'posts/index.ejs';
        res.render(postInd, {posts});
    } 
    catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    const { post } = req.load;
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
                attributes: ['teamId']
            });
            const belongsToSameTeam = userTeams.some(team => team.teamId === post.TeamId);

            const isAdmin = req.session.loginUser ? req.session.loginUser.isAdmin : false;
            const currentDate = new Date();
            const isVotingPeriod = currentDate >= post.votingStartDate && currentDate <= post.votingEndDate;
            const isVetoEnabled = currentDate < post.vetoDate;
            const formattedPost = {
                ...post.toJSON(),
                votingStartDate: post.votingStartDate ? new Date(post.votingStartDate).toLocaleString() : 'No especificada',
                votingEndDate: post.votingEndDate ? new Date(post.votingEndDate).toLocaleString() : 'No especificada',
                applicationDate: post.applicationDate ? new Date(post.applicationDate).toLocaleString() : 'No especificada',
                vetoDate: post.vetoDate ? new Date(post.vetoDate).toLocaleString() : 'No especificada',
                team: teamName,
                hasVoted: userPostVote && userPostVote.hasVoted,
            };
            res.render('posts/show', { post: formattedPost, isAdmin, isVotingPeriod, isVetoEnabled, belongsToSameTeam });
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
{   const { title, body, team, votingStartDate, votingEndDate, applicationDate, vetoDate } = req.body;
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
            vetoDate: convertedVetoDate
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

exports.destroy = async (req, res, next) => 
{   const attachment = req.load.post.attachment;
    try {
        await req.load.post.destroy();
        attachment && await attachment.destroy();
        const posts = '/posts';
        res.redirect(posts);
    } catch (error) { next(error); }
}; 

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
    const { vote } = req.body;
    const userId = req.session.loginUser.id;
  
    try {
      const userPostVote = await models.UserPostVotes.findOne({
        where: {
          postId: post.id,
          userId: userId,
        },
      });
  
      if (userPostVote && userPostVote.hasVoted) {
        return res.status(400).send('Ya has votado en esta propuesta.');
      }
  
      if (vote === 'for') {
        post.votesFor += 1;
      } else if (vote === 'against') {
        post.votesAgainst += 1;
      } else if (vote === 'abstain') {
        post.abstentions += 1;
      }
  
      if (!userPostVote) {
        await models.UserPostVotes.create({
          userId: userId,
          postId: post.id,
          hasVoted: true,
          lastVote: vote,
        });
      } else {
        await userPostVote.update({ hasVoted: true, lastVote: vote });
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
  
      if (userPostVote.lastVote === 'for') {
        post.votesFor -= 1;
      } else if (userPostVote.lastVote === 'against') {
        post.votesAgainst -= 1;
      } else if (userPostVote.lastVote === 'abstain') {
        post.abstentions -= 1;
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
      post.votesFor = 0;
      post.votesAgainst = 0;
      post.abstentions = 0;
      post.vetoed = true;
      await post.save();
  
      res.redirect(`/posts/${post.id}`);
    } catch (error) {
      next(error);
    }
};
