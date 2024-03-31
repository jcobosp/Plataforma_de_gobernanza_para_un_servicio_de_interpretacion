'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserPostVotes', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('UserPostVotes', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserPostVotes', 'createdAt');
    await queryInterface.removeColumn('UserPostVotes', 'updatedAt');
  }
};
