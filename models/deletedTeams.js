'use strict';
const {Model} =  require('sequelize');
module.exports = (sequelize, DataTypes) => {
    
    class DeletedTeam extends Model { }
    DeletedTeam.init(
        {   
            title: {
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
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            deletedBy: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, 
        {sequelize}
    );
    return DeletedTeam;
};