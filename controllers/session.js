const Sequelize = require("sequelize");
const {models} = require("../models");
const url = require('url');
const maxIdleTime = 5*60*1000;

exports.deleteExpiredUserSession = (req, res, next) => {
    if (req.session.loginUser ) {
        if ( req.session.loginUser.expires < Date.now() ) { 
            delete req.session.loginUser; 
            console.log('Info: User session has expired.');
        } else { 
            req.session.loginUser.expires = Date.now() + maxIdleTime;
        }
    }    next();
};

const authenticate = async (username, password) => {
    const user = await models.User.findOne({where: {username: username}})
    return user?.verifyPassword(password) ? user : null;
};

exports.new = (req, res, next) => {
    res.render('session/new');
};

exports.create = async (req, res, next) => {
    const username = req.body.username ?? "";
    const password = req.body.password ?? "";
    try {
        const user = await authenticate(username, password);
        if (user) {
            console.log('Info: Authentication successful.');
            req.session.loginUser = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                expires: Date.now() + maxIdleTime
            };
            res.redirect("/");
        } else {
            console.log('Error: Authentication has failed. Retry it again.');
            res.render('session/new');
        }
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};

exports.destroy = (req, res, next) => {
    delete req.session.loginUser;
    res.redirect("/login"); 
};

exports.loginRequired = (req, res, next) => 
{   if(req.session.loginUser){
        next();
    }else{
        res.redirect('/login');
    }
};

exports.adminOrMyselfRequired = (req, res, next) => {
    const isAdminBoolean = !!req.session.loginUser?.isAdmin;
    const isMyself = req.load.user.id === req.session.loginUser?.id;
    if (isAdminBoolean || isMyself) {
        next();
    } else {  
        res.send(403);
    }
};

exports.adminRequired = (req, res, next) => {
    if(!!req.session.loginUser?.isAdmin){
        next();
    } else{
        res.send(403);
    }
};
