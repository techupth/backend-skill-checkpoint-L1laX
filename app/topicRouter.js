import { Router, query } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
const topicRouter = Router();

const topicCollection = db.collection("topic");

topicRouter.get("/", async (req, res) => {
  const keywords = req.query.keywords;
  const category = req.query.category;
  const query = {};
  if (!keywords || !category) {
    query;
  }
  if (keywords) {
    query.headerTitle = new RegExp(keywords, "ig");
  }
  if (category) {
    query.category = { $all: category.split(",") };
  }
  try {
    const results = await topicCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    if (!results.length) {
      return res.status(500).json({
        message: "Can't find topic.",
      });
    }
    return res.status(200).json({
      data: results,
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

topicRouter.get("/:topicId", async (req, res) => {
  const topicId = new ObjectId(req.params.topicId);
  try {
    const results = await topicCollection.find({ _id: topicId }).toArray();
    if (!results.length) {
      return res.status(400).json({
        message: "Can't find matching topic id",
      });
    }
    return res.status(200).json({
      message: "Fetching Successfully",
      data: results[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

topicRouter.post("/", async (req, res) => {
  const createdAt = new Date();
  const newTopic = { ...req.body, createdAt, vote: { upVote: 0, downVote: 0 } };
  const { headerTitle, description, category } = newTopic;
  if (!headerTitle || !description || !category || !category[0]) {
    return res.status(400).json({
      message: "Invalid requset,Missing required body",
    });
  }
  try {
    const results = await topicCollection.insertOne(newTopic);
    return res.status(200).json({
      message: "Topic record Successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

topicRouter.patch("/:topicId", async (req, res) => {
  const topicId = new ObjectId(req.params.topicId);
  const vote = req.query.vote;
  const query = {
    _id: topicId,
  };
  if (["upVote", "downVote"].includes(vote)) {
    const updateVote = `vote.${vote}`;
    try {
      const result = await topicCollection.updateOne(query, {
        $inc: { [updateVote]: 1 },
      });
      return res.status(200).json({
        message: "updateVote Complete",
      });
    } catch {
      return res.status(500).json({
        message: "Server error",
      });
    }
  }else{
    return res.status(400).json({
      message: "Invalid request,Can't found type vote",
    });
  }
});

topicRouter.put("/topicId", async (req, res) => {
  const topicId = new ObjectId(req.params.topicId);
  const lastUpdate = new Date();
  const updateTopic = { ...req.body, lastUpdate };
  if (!headerTitle || !description || !like || !category || !category[0]) {
    return res.status(400).json({
      message: "Invalid request,Missing required body",
    });
  }
  try {
    const results = await topicCollection.updateOne(
      { _id: topicId },
      { $set: updateTopic }
    );
    return res.status(200).json({
      message: "Topic update Successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

topicRouter.delete("/:topicId", async (req, res) => {
  const topicId = new ObjectId(req.params.topicId);
  const commentCollection = db.collection("comment");
  try {
    const result = await topicCollection.deleteOne({ _id: topicId });
    await commentCollection.deleteMany({ topicId: req.params.topicId });
    if (!result.deletedCount) {
      return res.status(400).json({
        message: "Invalid request,Missing matching id",
      });
    } else {
      return res.status(200).json({
        message: "delete complete",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

export default topicRouter;
