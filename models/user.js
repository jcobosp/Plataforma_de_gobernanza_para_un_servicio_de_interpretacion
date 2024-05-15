'use strict';
const {Model} = require('sequelize');
const crypt = require('../helpers/crypt');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        verifyPassword(password) { return crypt.encryptPassword(password, this.salt) === this.password; }
    }
    User.init({
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {notEmpty: {msg: "Username must not be empty."}}
        },
        password: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Password must not be empty."}},
            set(password) {
                // Random String used as salt.
                this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
                this.setDataValue('password', crypt.encryptPassword(password, this.salt));
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: {
                    msg: "email not valid"
                }
            }
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false 
        },
        reputation: { 
            type: DataTypes.INTEGER, 
            defaultValue: 0 
        },
        tokens: { 
            type: DataTypes.INTEGER, 
            defaultValue: 0 
        },
        isAdminToken: {
            type: DataTypes.BOOLEAN,
            defaultValue: false 
        },
        isAdminTeam: {
            type: DataTypes.BOOLEAN,
            defaultValue: false 
        },
        isAdminProposal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false 
        },
        lastDailyRewardClaimedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
        },    
        { sequelize } 
    );
    return User;
};
