import { DataTypes } from "sequelize";
import sequelize from "../db.js";

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
      field: 'post_data'
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
    timestamps: true,
    underscored: true
  }
);

export default Vital;
