'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DeletedTeams', 'tokens', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('DeletedTeams', 'numUsers', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('DeletedTeams', 'adminTeamId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', 
        key: 'id'      
      },
      onUpdate: 'CASCADE', 
      onDelete: 'SET NULL' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DeletedTeams', 'tokens');
    await queryInterface.removeColumn('DeletedTeams', 'numUsers');
    await queryInterface.removeColumn('DeletedTeams', 'adminTeamId');
  }
};