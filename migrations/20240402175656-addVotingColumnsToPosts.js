'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'min_voting', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Posts', 'max_voting', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Posts', 'min_users_voted', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Posts', 'voting_reward', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Posts', 'voting_failure_penalty', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Posts', 'voting_success_reward', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'min_voting');
    await queryInterface.removeColumn('Posts', 'max_voting');
    await queryInterface.removeColumn('Posts', 'min_users_voted');
    await queryInterface.removeColumn('Posts', 'voting_reward');
    await queryInterface.removeColumn('Posts', 'voting_failure_penalty');
    await queryInterface.removeColumn('Posts', 'voting_success_reward');
  }
};

