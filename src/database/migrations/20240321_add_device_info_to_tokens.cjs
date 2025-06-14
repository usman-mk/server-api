'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tokens', 'ip_address', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'is_revoked'
    });

    await queryInterface.addColumn('tokens', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'ip_address'
    });

    await queryInterface.addColumn('tokens', 'device_info', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'user_agent'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tokens', 'ip_address');
    await queryInterface.removeColumn('tokens', 'user_agent');
    await queryInterface.removeColumn('tokens', 'device_info');
  }
}; 