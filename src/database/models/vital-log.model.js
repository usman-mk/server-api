import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const VitalLog = sequelize.define(
  "VitalLog",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    vitalId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'vital_id',
      references: {
        model: 'vitals',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'created_by'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vital_logs",
    timestamps: true,
    underscored: true,
    updatedAt: false, // We don't need updatedAt for logs
    indexes: [
      {
        name: 'vital_logs_vital_id',
        fields: ['vital_id']
      },
      {
        name: 'vital_logs_created_at',
        fields: ['created_at']
      }
    ]
  }
);

export default VitalLog; 