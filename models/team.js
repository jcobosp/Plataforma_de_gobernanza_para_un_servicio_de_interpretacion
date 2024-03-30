'use strict' ;
const {Model} =  require('sequelize');
module.exports = (sequelize, DataTypes) => {
    
    class Team extends Model { }
    Team.init(
        {   title: {
                type: DataTypes.STRING ,
                validate: {notEmpty: {msg: "Title must not be empty"}}
            },
            body: {
                type: DataTypes.TEXT,
                validate: {notEmpty: {msg: "Body must not be empty"}}
            },
            tokens: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            numUsers: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            adminTeamId: {
                type: DataTypes.INTEGER,
                allowNull: true 
            }
        }, 
        {sequelize}
    );
    return Team ;
};


