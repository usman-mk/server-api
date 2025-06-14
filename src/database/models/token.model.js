import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('access', 'refresh'),
    allowNull: false,
    defaultValue: 'access'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'device_info'
  }
}, {
  tableName: 'tokens',
  underscored: true,
  indexes: [
    {
      name: 'tokens_user_id',
      fields: ['user_id']
    },
    {
      name: 'tokens_token',
      fields: ['token']
    },
    {
      name: 'tokens_ip_address',
      fields: ['ip_address']
    },
    {
      name: 'tokens_type',
      fields: ['type']
    }
  ]
});

export default Token; 