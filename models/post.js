'use strict' ;
const {Model} =  require('sequelize');
module.exports = (sequelize, DataTypes) => {
    
    class Post extends Model { }
    Post.init(
        {   title: {
                type: DataTypes.STRING ,
                validate: {notEmpty: {msg: "Title must not be empty"}}
            },
            body: {
                type: DataTypes.TEXT,
                validate: {notEmpty: {msg: "Body must not be empty"}}
            },
            votingStartDate: {
                type: DataTypes.DATE
            },
            votingEndDate: {
                type: DataTypes.DATE
            },
            applicationDate: {
                type: DataTypes.DATE
            },
            vetoDate: {
                type: DataTypes.DATE
            },
            votesFor: {
                type: DataTypes.INTEGER
            },
            votesAgainst: {
                type: DataTypes.INTEGER
            },
            abstentions: {
                type: DataTypes.INTEGER
            },
            vetoed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, 
        {sequelize}
    );

    Post.associate = (models) => {
        Post.belongsTo(models.Team, { foreignKey: 'TeamId', as: 'team' });
    };

    return Post ;
};
