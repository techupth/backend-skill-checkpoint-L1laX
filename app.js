import express from "express";
import { client } from "./utils/db.js";
import topicRouter from "./app/topicRouter.js";
import commentRouter from "./app/commentRouter.js";

async function init() {
  const app = express();
  const port = 4000;
  try {
    await client.connect();
    console.log("connected to server");
  } catch {
    console.error(`Can'y connect to server`);
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    return res.json("Hello Skill Checkpoint #2");
  });

  app.use("/topic", topicRouter);
  app.use("/topic/", commentRouter);
  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();
