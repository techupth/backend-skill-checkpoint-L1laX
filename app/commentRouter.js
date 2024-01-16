import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const commentRouter = Router();

const commentCollection = db.collection("comment");

commentRouter.get("/:topicId/comment", async (req, res) => {
  const topicId = req.params.topicId;
  const query = {};
  if (topicId) {
    query.topicId = topicId;
  }

  try {
    const results = await commentCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    if (!results.length) {
      return res.status(500).json({
        message: "Can't find comment.",
      });
    }
    return res.status(200).json({
      message: "Fetching Successfully",
      data: results,
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});
commentRouter.get("/:topicId/comment/:commentId", async (req, res) => {
  const commentId = new ObjectId(req.params.commentId);
  const topicId = req.params.topicId;

  const query = {};

  if (topicId || commentId) {
    query._id = commentId;
    query.topicId = topicId;
  } else {
    return res.status(400).json({
      message: "Invalid request,Missing Id field",
    });
  }
  try {
    const result = await commentCollection.find(query).toArray();
    if (result) {
      return res.status(200).json({
        message: "Fetching Successfully",
        data: result[0],
      });
    } else {
      return res.status(400).json({
        message: "Invalid request,Missing matching topic id ",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});
commentRouter.post("/:topicId/comment/", async (req, res) => {
  const topicId = req.params.topicId;
  const createdAt = new Date();
  const newComment = {
    ...req.body,
    vote: { upVote: 0, downVote: 0 },
    topicId,
    createdAt,
  };

  if (!newComment.comment || newComment.comment.length === 0) {
    return res.status(400).json({
      message: "Invalid request,Missing required field",
    });
  }
  try {
    const result = await commentCollection.insertOne(newComment);
    return res.status(200).json({
      message: "Comment record Successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});
commentRouter.put("/:topicId/comment/:commentId", async (req, res) => {
  const commentId = new ObjectId(req.params.commentId);
  const lastUpdate = new Date();
  const topicId = req.params.topicId;
  const updateComment = { ...req.body, lastUpdate };
  const query = { _id: commentId, topicId: topicId };
  if (!updateComment.comment || !updateComment.comment.length > 300) {
    return res.status(400).json({
      message: "Invalid request,Missing required field",
    });
  }
  try {
    const count = await commentCollection.countDocuments(query);
    if (!count) {
      return res.status(400).json({
        message: "Invalid request,Missing matching comment",
      });
    } else {
      await commentCollection.updateOne(query, { $set: updateComment });
      return res.status(200).json({
        message: "Comment update Successfully",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

commentRouter.patch("/:topicId/comment/:commentId", async (req, res) => {
  const commentId = new ObjectId(req.params.commentId);
  const topicId = req.params.topicId;
  const vote = req.query.vote;
  const query = {
    _id: commentId,
    topicId: topicId,
  };
  if (["upVote", "downVote"].includes(vote)) {
    const updateVote = `vote.${vote}`;
    try {
      const result = await commentCollection.updateOne(query, {
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
  } else {
    return res.status(400).json({
      message: "Invalid request,Can't found type vote",
    });
  }
});

commentRouter.delete("/:topicId/comment/:commentId", async (req, res) => {
  const commentId = new ObjectId(req.params.commentId);
  try {
    const result = await commentCollection.deleteOne({ _id: commentId });
    if (!result.deletedCount) {
      return res.status(400).json({
        message: "Invalid request,Missing matching comment",
      });
    } else {
      return res.status(200).json({
        message: "Delete Comment Successfully",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
});

export default commentRouter;
