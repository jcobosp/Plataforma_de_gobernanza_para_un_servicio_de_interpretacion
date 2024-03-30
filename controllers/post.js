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

exports.show = (req, res, next) => {
    const { post } = req.load;
    if (post) {
        // Formatear y mostrar las fechas, o imprimir un mensaje si son null o undefined
        const formattedPost = {
            ...post.toJSON(),
            votingStartDate: post.votingStartDate ? new Date(post.votingStartDate).toLocaleDateString() : 'No especificada',
            votingEndDate: post.votingEndDate ? new Date(post.votingEndDate).toLocaleDateString() : 'No especificada',
            applicationDate: post.applicationDate ? new Date(post.applicationDate).toLocaleDateString() : 'No especificada',
            vetoDate: post.vetoDate ? new Date(post.vetoDate).toLocaleDateString() : 'No especificada'
        };
        res.render('posts/show', { post: formattedPost });
    } else {
        // Manejar el caso en que el post no existe
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
        res.render('posts/edit', {...req.load, teams}); 
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    const { post } = req.load;
    post.title = req.body.title;
    post.body = req.body.body;
    post.votingStartDate = req.body.votingStartDate;
    post.votingEndDate = req.body.votingEndDate;
    post.applicationDate = req.body.applicationDate;
    post.vetoDate = req.body.vetoDate;
    try {
        await post.save();
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
