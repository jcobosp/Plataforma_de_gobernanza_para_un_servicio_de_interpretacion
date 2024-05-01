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

exports.show = (req, res, next) => {
    const {user} = req.load;
    res.render('users/show', {user});
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




exports.destroy = async (req, res, next) => {
    try {
        if (req.session.loginUser?.id === req.load.user.id) {
            delete req.session.loginUser;
        }
        await req.load.user.destroy()
        console.log('Success: User deleted successfully.');
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};


exports.registrarse = function(req, res, next) {
    res.render('users/registrarse', { user: models.User.build() });
};