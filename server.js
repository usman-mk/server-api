import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { insertQueue, worker } from "./queue.js";
import Vital from "./models/Vital.js";

dotenv.config();

const PORT = process.env.PORT || 9000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

app.post("/data", async (req, res) => {
  try {
    const job = await insertQueue.add("insert", { value: req.body });
    res.json({ status: "queued", data: job });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/data/latest", async (req, res) => {
  try {
    const latest = await Vital.findOne({
      order: [["createdAt", "DESC"]],
    });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// เมื่อ worker ทำงานเสร็จ ให้ส่งข้อมูลผ่าน socket.io
worker.on("completed", (job, result) => {
  io.emit("new_data", result);
  console.log(`Real-time update sent for job ${job.id}`, result);
});

httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
