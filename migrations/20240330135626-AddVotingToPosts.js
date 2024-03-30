'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'votesFor', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('Posts', 'votesAgainst', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('Posts', 'abstentions', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'votesFor');
    await queryInterface.removeColumn('Posts', 'votesAgainst');
    await queryInterface.removeColumn('Posts', 'abstentions');
  }
};

