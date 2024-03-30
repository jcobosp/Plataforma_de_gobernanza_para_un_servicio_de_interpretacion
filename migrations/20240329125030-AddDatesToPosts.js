'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'votingStartDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date() // Valor predeterminado: Fecha y hora actual
    });

    await queryInterface.addColumn('Posts', 'votingEndDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valor predeterminado: 24 horas después de la fecha y hora actual
    });

    await queryInterface.addColumn('Posts', 'applicationDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Valor predeterminado: 2 días después de la fecha y hora actual
    });

    await queryInterface.addColumn('Posts', 'vetoDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(Date.now() + 12 * 60 * 60 * 1000) // Valor predeterminado: 12 horas después de la fecha y hora actual
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'votingStartDate');
    await queryInterface.removeColumn('Posts', 'votingEndDate');
    await queryInterface.removeColumn('Posts', 'applicationDate');
    await queryInterface.removeColumn('Posts', 'vetoDate');
  }
};
