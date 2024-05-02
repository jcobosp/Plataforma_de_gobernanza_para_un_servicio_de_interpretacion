'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DeletedPost extends Model {}

    DeletedPost.init({
        title: {
            type: DataTypes.STRING,
            validate: { notEmpty: { msg: "Title must not be empty" } }
        },
        body: {
            type: DataTypes.TEXT,
            validate: { notEmpty: { msg: "Body must not be empty" } }
        },
        attachmentId: {
            type: DataTypes.STRING
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        deletedBy: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { sequelize });

    DeletedPost.associate = (models) => {
        DeletedPost.belongsTo(models.Attachment, { foreignKey: 'attachmentId', as: 'attachment' });
    };

    return DeletedPost;
};