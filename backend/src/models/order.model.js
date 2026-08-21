const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
    foodPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'foodpartner', required: true },
    customerName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: [ 'placed', 'preparing', 'delivered', 'cancelled' ], default: 'placed' },
    paymentStatus: { type: String, enum: [ 'pending', 'paid' ], default: 'pending' },
    confirmationEmailSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);