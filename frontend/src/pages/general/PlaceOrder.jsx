import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/order.css';

const PlaceOrder = () => {
    const { foodId } = useParams();
    const navigate = useNavigate();
    const [ food, setFood ] = useState(null);
    const [ menuItems, setMenuItems ] = useState([]);
    const [ customerName, setCustomerName ] = useState('');
    const [ address, setAddress ] = useState('');
    const [ contactNumber, setContactNumber ] = useState('');
    const [ quantity, setQuantity ] = useState(1);
    const [ error, setError ] = useState('');
    const [ submitting, setSubmitting ] = useState(false);

    useEffect(() => {
        axios.get('https://feedo-wolw.onrender.com/api/food', { withCredentials: true })
            .then((response) => {
                const selectedFood = response.data.foodItems.find((item) => item._id === foodId);
                if (!selectedFood) throw new Error('Food item not found');
                setFood(selectedFood);
                setMenuItems(response.data.foodItems.filter((item) => item.foodPartner === selectedFood.foodPartner));
            })
            .catch((requestError) => {
                if (requestError.response?.status === 401) navigate('/user/login');
                else setError(requestError.message || 'Unable to load this food item');
            });
    }, [ foodId, navigate ]);

    const total = useMemo(() => (Number(food?.price || 0) * quantity).toFixed(2), [ food, quantity ]);

    async function submitOrder(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const response = await axios.post(
                `https://feedo-wolw.onrender.com/api/food/${food._id}/orders`,
                { customerName, address, contactNumber, quantity },
                { withCredentials: true }
            );
            navigate('/order-confirmation', { state: response.data });
        } catch (requestError) {
            if (requestError.response?.status === 401) navigate('/user/login');
            else setError(requestError.response?.data?.message || 'Unable to place order');
        } finally {
            setSubmitting(false);
        }
    }

    if (error) return <main className="order-page"><div className="order-card"><p className="order-error">{error}</p><Link to="/">Back home</Link></div></main>;
    if (!food) return <main className="order-page"><div className="order-card"><p>Loading order details...</p></div></main>;

    return (
        <main className="order-page">
            <section className="order-card">
                <Link className="order-back" to={food.foodPartner ? `/food-partner/${food.foodPartner}` : '/'}>Back</Link>
                <h1>Place your order</h1>
                <div className="order-item-summary">
                    <video src={food.video} muted playsInline controls preload="metadata" />
                    <div><h2>{food.name}</h2><p>{food.description}</p><strong>${Number(food.price || 0).toFixed(2)} each</strong></div>
                </div>
                <form className="order-form" onSubmit={submitOrder}>
                    <label>Choose an item
                        <select value={food._id} onChange={(e) => setFood(menuItems.find((item) => item._id === e.target.value))}>
                            {menuItems.map((item) => <option key={item._id} value={item._id}>{item.name} - ${Number(item.price || 0).toFixed(2)}</option>)}
                        </select>
                    </label>
                    <label>Name<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required /></label>
                    <label>Delivery address<textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} /></label>
                    <label>Contact number<input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required /></label>
                    <label>Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></label>
                    <div className="order-total"><span>Total to pay</span><strong>${total}</strong></div>
                    <p className="payment-note">Payment status: pending. The partner will confirm your order.</p>
                    <button className="order-submit" type="submit" disabled={submitting}>{submitting ? 'Placing order...' : 'Place order'}</button>
                </form>
            </section>
        </main>
    );
};

export default PlaceOrder;