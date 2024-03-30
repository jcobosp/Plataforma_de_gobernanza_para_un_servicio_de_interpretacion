'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Teams', 'tokens', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Teams', 'numUsers', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Teams', 'adminTeamId', {
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
    await queryInterface.removeColumn('Teams', 'tokens');
    await queryInterface.removeColumn('Teams', 'numUsers');
    await queryInterface.removeColumn('Teams', 'adminTeamId');
  }
};




