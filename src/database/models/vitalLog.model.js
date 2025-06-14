import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import { Vital } from './vital.model.js';

export const VitalLog = sequelize.define('VitalLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vitalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vital,
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'vital_logs',
  timestamps: true,
  underscored: true
});

// Define relationship
VitalLog.belongsTo(Vital, {
  foreignKey: 'vitalId',
  as: 'vital'
}); 