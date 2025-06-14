import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Vital = sequelize.define('Vital', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  heartRate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bloodPressure: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidBloodPressure(value) {
        if (!value.systolic || !value.diastolic) {
          throw new Error('Blood pressure must include systolic and diastolic values');
        }
      }
    }
  },
  respiratoryRate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  oxygenSaturation: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'vitals',
  timestamps: true,
  underscored: true
}); 