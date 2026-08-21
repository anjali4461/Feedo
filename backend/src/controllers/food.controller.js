const foodModel = require('../models/food.model');
const storageService = require('../services/storage.services');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const commentModel = require("../models/comment.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        price: Number(req.body.price),
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({})
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully"
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(200).json({
            message: "No saved foods found",
            savedFoods: []
        });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}

async function getComments(req, res) {
    const commentDocuments = await commentModel.find({ food: req.params.foodId })
        .populate('user', 'fullName')
        .sort({ createdAt: -1 });
    const comments = commentDocuments.map((comment) => ({
        ...comment.toObject(),
        isOwner: comment.user?._id.toString() === req.user._id.toString()
    }));

    res.status(200).json({ comments });
}

async function createComment(req, res) {
    const text = req.body.text?.trim();

    if (!text) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const food = await foodModel.findById(req.params.foodId);
    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    const comment = await commentModel.create({
        food: food._id,
        user: req.user._id,
        text
    });

    await comment.populate('user', 'fullName');
    res.status(201).json({
        comment: {
            ...comment.toObject(),
            isOwner: true
        }
    });
}

async function updateComment(req, res) {
    const text = req.body.text?.trim();

    if (!text) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await commentModel.findOneAndUpdate(
        { _id: req.params.commentId, user: req.user._id },
        { text },
        { new: true, runValidators: true }
    ).populate('user', 'fullName');

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
        comment: {
            ...comment.toObject(),
            isOwner: true
        }
    });
}

async function deleteComment(req, res) {
    const comment = await commentModel.findOneAndDelete({
        _id: req.params.commentId,
        user: req.user._id
    });

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
}


module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood,
    getComments,
    createComment,
    updateComment,
    deleteComment
}