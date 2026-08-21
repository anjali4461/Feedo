const nodemailer = require('nodemailer');

async function sendOrderConfirmation({ to, order }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: `Order ${order._id} confirmed`,
        text: `Your order for ${order.food.name} has been placed. Total: ${order.totalAmount.toFixed(2)}. Delivery address: ${order.address}.`
    });

    return true;
}

module.exports = { sendOrderConfirmation };