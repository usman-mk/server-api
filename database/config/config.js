import dotenv from "dotenv";
dotenv.config();

export default {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "database_name",
    host: process.env.DB_HOST || "127.0.0.1",
    timezone: process.env.TZ ||"+07:00",
    dialect: "mysql",
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "database_name_test",
    host: process.env.DB_HOST || "127.0.0.1",
    timezone: process.env.TZ ||"+07:00",
    dialect: "mysql",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    timezone: process.env.TZ ||"+07:00",
    dialect: "mysql",
  },
};
