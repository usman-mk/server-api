import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../database/db.js";

const Vital = sequelize.define(
  "Vital",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postData: {
      type: DataTypes.JSON,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "vitals",
  }
);

export default Vital;
