const Order = require('../models/Order');

// Delivery agent sees orders assigned to them
exports.getMyDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedTo: req.user._id };
    if (status) query.status = status;
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delivery agent updates status (confirmed → processing → shipped → delivered)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['processing', 'shipped', 'delivered'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Delivery agents can only set processing, shipped or delivered' });

    const order = await Order.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found or not assigned to you' });

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user.name, note: note || `Marked as ${status} by delivery agent` });
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
