import { Sequelize } from "sequelize";
import { config } from "../config/index.js";
import logger from "../services/logger.service.js";

const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: config.database.dialect,
  logging: config.database.logging,
  timezone: '+07:00',
  pool: config.database.pool,
  dialectOptions: {
    connectTimeout: 60000, // 60 seconds
    // MySQL specific options
    dateStrings: true,
    typeCast: true,
    timezone: '+07:00' // for writing to database
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true
  }
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error; // Let the application handle the error
  }
};
export default sequelize;

