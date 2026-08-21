import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/order.css';

const OrderConfirmation = () => {
    const { state } = useLocation();
    const order = state?.order;

    return (
        <main className="order-page">
            <section className="order-card order-success">
                <div className="success-mark" aria-hidden="true">✓</div>
                <h1>Order placed</h1>
                <p>Your order has been sent to the food partner.</p>
                {order && <p><strong>Order #{order._id.slice(-8)}</strong><br />Total: ${Number(order.totalAmount).toFixed(2)}</p>}
                <p>{state?.emailSent ? 'A confirmation email was sent to your account email.' : 'Your order is confirmed in the app. Add SMTP settings to enable email delivery.'}</p>
                <Link className="order-submit" to="/">Continue browsing</Link>
            </section>
        </main>
    );
};

export default OrderConfirmation;