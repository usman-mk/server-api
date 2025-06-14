# Node.js API Server

A modern Node.js API server with Express.js

## Project Structure

The project uses a modular architecture with the following structure:

```
src/
  ├── api/          # API routes and controllers
  ├── config/       # Configuration files
  ├── database/     # Database models and migrations
  ├── middleware/   # Express middleware
  ├── services/     # Business logic services
  ├── utils/        # Utility functions
  ├── validations/  # Validation schemas
  └── scripts/      # Utility scripts
```

## ES Modules

This project uses Native ES Modules (ESM) instead of CommonJS or Babel. This decision was made to:

- Utilize native Node.js ES Modules support (Node.js 12+)
- Remove unnecessary build steps and complexity
- Reduce dependencies (no Babel required)
- Use modern JavaScript features natively

To enable ES Modules:
1. Set `"type": "module"` in package.json
2. Use `.js` extension for all files
3. Use ES Modules syntax:
   ```javascript
   // Import
   import express from 'express';
   import { config } from './config/index.js';
   
   // Export
   export const myFunction = () => {};
   export default class MyClass {};
   ```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server in development mode with hot reload
- `npm test` - Run tests
- `npm run route:list [filter]` - List API routes
  - No filter: Show all routes
  - With filter (e.g. `/api`): Show routes containing the filter text

## Requirements

- Node.js 12.0 or later
- MySQL 5.7 or later
- Redis 6.0 or later

## Installation

1. Clone the repository
2. Copy `.env-example` to `.env` and update the values
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

# Node Server API with Sequelize, Socket.io and Redis Queue

โปรเจกต์ Node.js นี้ใช้ Sequelize ORM กับ MySQL, Redis queue สำหรับงาน insert ข้อมูล และ Socket.io สำหรับส่งข้อมูลเรียลไทม์

---

## Features

- รับข้อมูลผ่าน API `/data` แล้วใส่ข้อมูลลง queue
- มี worker ดึงข้อมูลจาก queue มา insert ลงฐานข้อมูล MySQL ผ่าน Sequelize
- ส่งข้อมูลใหม่ไปยัง client แบบ realtime ด้วย Socket.io
- ดึงข้อมูลล่าสุดจากฐานข้อมูลผ่าน API `/data/latest`

---

## Technologies

- Node.js
- Express
- Sequelize ORM
- MySQL / MariaDB
- Redis + BullMQ (Queue)
- Socket.io
- dotenv (จัดการ environment variables)

---

## Installation

```bash
git clone https://github.com/usman-mk/server-api.git
cd server-api
npm install
