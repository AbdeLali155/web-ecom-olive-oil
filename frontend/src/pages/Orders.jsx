import React, { useState, useEffect } from 'react';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.reverse()); // Newest first
      } catch (err) {
        console.error(err);
        alert("Échec du chargement des commandes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order) => setSelectedOrder(order);
  const handleBackToOrders = () => setSelectedOrder(null);

  const formatDate = (isoString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(isoString).toLocaleDateString('fr-FR', options);
  };

  const returnHome = () => (window.location.href = '/');

  if (loading) return <div className="p-4">Loading orders...</div>;

  if (selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <button
          onClick={handleBackToOrders}
          className="text-[#8a7233] hover:text-[#6c5a26] font-medium flex items-center"
        >
          ← Back to orders
        </button>

        <h2 className="text-2xl font-bold text-[#4e4219]">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>

        <div className="bg-white shadow-md rounded-lg border border-[#d8c9a0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d8c9a0] flex justify-between">
            <div>
              <p className="font-semibold text-[#4e4219]">Past the {formatDate(selectedOrder.orderDate)}</p>
              <p className="text-sm text-[#6c5a26]">Delivery method : {selectedOrder.deliveryMethod === 'home' ? 'Livraison à domicile' : 'Récupération en magasin'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#4e4219]">{selectedOrder.total} DH</p>
              <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full">{selectedOrder.status || 'En attente'}</span>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-[#d8c9a0]">
            <h4 className="font-semibold text-[#4e4219] mb-3">Articles</h4>
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span>{item.quantity} x {item.name} ({item.variation})</span>
                <span>{item.price} DH</span>
              </div>
            ))}
            {selectedOrder.deliveryFee > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span>delivery costs</span>
                <span>{selectedOrder.deliveryFee} DH</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4">
            <h4 className="font-semibold text-[#4e4219] mb-2">Adresse de livraison</h4>
            <p className="text-sm text-[#6c5a26] mb-1">{selectedOrder.customer?.address}</p>
            <p className="text-sm text-[#6c5a26]">Name: {selectedOrder.customer?.name}</p>
            <p className="text-sm text-[#6c5a26]">Phone Number: {selectedOrder.customer?.phone}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={returnHome}
            className="bg-[#8a7233] text-white px-4 py-2 rounded hover:bg-[#6c5a26]"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#4e4219]">My Orders</h2>
        <button
          onClick={returnHome}
          className="text-[#8a7233] hover:text-[#6c5a26] text-sm"
        >
          ← Return to home
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-[#6c5a26]">No orders found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-[#d8c9a0] divide-y divide-[#d8c9a0]">
          {orders.map((order) => (
            <div key={order._id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#4e4219]">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-[#6c5a26]">Past the {formatDate(order.orderDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#4e4219]">{order.total} DH</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {order.status || 'En attente'}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="text-sm text-[#8a7233] hover:text-[#6c5a26]"
                >
                  See details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
