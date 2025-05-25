import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

import { fixBigInt } from "./helpers/index.js";
import Vital from "./models/Vital.js";

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const insertQueue = new Queue("insertQueue", { connection });

const worker = new Worker(
  "insertQueue",
  async (job) => {
    const { value } = job.data;
    const created = await Vital.create(value);
    // ส่งข้อมูลใหม่ไปยัง Socket.io (จะส่งผ่าน event จาก server.js)
    return fixBigInt(created);
  },
  { connection }
);

// Log error ที่เกิดกับ job ที่ fail
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

export { insertQueue, worker, connection };
