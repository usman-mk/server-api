"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tokens", "type", {
      type: Sequelize.ENUM("access", "refresh"),
      allowNull: false,
      defaultValue: "access",
      after: "token",
    });

    await queryInterface.addIndex("tokens", ["type"], {
      name: "tokens_type",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("tokens", "tokens_type");
    await queryInterface.removeColumn("tokens", "type");
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_tokens_type;"
    );
  },
};
