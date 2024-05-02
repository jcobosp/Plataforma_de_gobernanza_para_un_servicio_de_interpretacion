'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = 
{ async up (queryInterface, Sequelize) {
    await queryInterface.createTable('DeletedPosts',
      {
          id: 
          {
              type: Sequelize.INTEGER, 
              allowNull: false ,
              primaryKey: true,
              autoIncrement: true ,
              unique: true
          },
          title: 
          {
              type: Sequelize.STRING,
              validate: {notEmpty: {msg: "title must not be empty."}}
          },
          body: 
          {
              type: Sequelize.TEXT,
              validate: {notEmpty: {msg: "body must not be empty."}}
          },
          attachmentId: 
          {
            type: Sequelize.STRING,
            references: 
            {
              model: "Attachments" ,
              key: "id"
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL' 
          },
          deletedAt: 
          {
              type: Sequelize.DATE ,
              allowNull: false
          },
          deletedBy: 
          {
              type: Sequelize.STRING,
              allowNull: false
          },
          createdAt: 
          {
              type: Sequelize.DATE ,
              allowNull: false
          },
          updatedAt: {
              type: Sequelize.DATE ,
              allowNull: false
          }
      });
  },
  async down (queryInterface, Sequelize) {
    const deletedPosts = 'DeletedPosts';
    await queryInterface.dropTable(deletedPosts);
  }
};