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
