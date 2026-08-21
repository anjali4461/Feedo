const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const orderModel = require('../models/order.model');

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId)
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId })

    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }

    const orderStats = await orderModel.aggregate([
        {
            $match: {
                foodPartner: foodPartner._id,
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                totalMeals: { $sum: '$quantity' },
                customers: { $addToSet: '$user' }
            }
        },
        {
            $project: {
                _id: 0,
                totalMeals: 1,
                customersServed: { $size: '$customers' }
            }
        }
    ]);
    const stats = orderStats[ 0 ] || { totalMeals: 0, customersServed: 0 };

    res.status(200).json({
        message: "Food partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner,
            totalMeals: stats.totalMeals,
            customersServed: stats.customersServed
        }

    });
}

module.exports = {
    getFoodPartnerById
};