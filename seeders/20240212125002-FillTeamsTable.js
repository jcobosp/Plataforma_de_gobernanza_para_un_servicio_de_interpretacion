'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Teams', [
      {
          title: 'Interpretación',
          body: 'Primer equipo creado',
          tokens: 0, 
          numUsers: 0, 
          adminTeamId: null, 
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          title: 'Audio',
          body: 'Segundo equipo creado',
          tokens: 0, 
          numUsers: 0, 
          adminTeamId: null, 
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          title: 'Internet',
          body: 'Tercer equipo creado',
          tokens: 0, 
          numUsers: 0, 
          adminTeamId: null, 
          createdAt: new Date(),
          updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    const teams = 'Teams';
    await queryInterface.bulkDelete(teams, null, {});
  }
};

