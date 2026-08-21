const mongoose = require('mongoose');
const foodModel = require('../models/food.model');
const orderModel = require('../models/order.model');
const { sendOrderConfirmation } = require('../services/email.services');

async function createOrder(req, res) {
    const { customerName, address, contactNumber, quantity } = req.body;
    const { foodId } = req.params;
    const parsedQuantity = Number(quantity);

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({ message: 'Invalid food item' });
    }
    if (!customerName?.trim() || !address?.trim() || !contactNumber?.trim() || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ message: 'Complete delivery details and choose a valid quantity' });
    }

    const food = await foodModel.findById(foodId).populate('foodPartner', 'name');
    if (!food) {
        return res.status(404).json({ message: 'Food item not found' });
    }

    const order = await orderModel.create({
        user: req.user._id,
        food: food._id,
        foodPartner: food.foodPartner._id,
        customerName: customerName.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        quantity: parsedQuantity,
        unitPrice: food.price,
        totalAmount: food.price * parsedQuantity
    });

    const populatedOrder = await orderModel.findById(order._id).populate('food', 'name price video');
    let confirmationEmailSent = false;
    try {
        confirmationEmailSent = await sendOrderConfirmation({ to: req.user.email, order: { ...populatedOrder.toObject(), food: populatedOrder.food } });
    } catch (error) {
        console.error('Order confirmation email failed:', error.message);
    }

    order.confirmationEmailSent = confirmationEmailSent;
    await order.save();

    res.status(201).json({
        message: 'Order placed successfully',
        emailSent: confirmationEmailSent,
        order: { ...populatedOrder.toObject(), confirmationEmailSent }
    });
}

module.exports = { createOrder };