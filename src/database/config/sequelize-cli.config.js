// Note: We need to use CommonJS here because Sequelize CLI doesn't support ES modules
require('@babel/register')({
  presets: ['@babel/preset-env'],
  ignore: ['node_modules']
});

const { config } = require('../config/index.js');

module.exports = {
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone
  },
  test: {
    username: config.database.user,
    password: config.database.password,
    database: `${config.database.name}_test`,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone
  },
  production: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone
  }
}; 