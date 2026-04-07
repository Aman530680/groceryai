const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Recipe = require('../models/Recipe');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, totalRecipes] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Recipe.countDocuments(),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    const salesByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const lowStockProducts = await Product.find({ stock: { $lt: 10 }, isActive: true })
      .select('name stock category')
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRecipes,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      ordersByStatus,
      recentOrders,
      salesByDay,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    let orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      orders = orders.filter(
        (o) =>
          o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o._id.toString().includes(search)
      );
    }

    const total = await Order.countDocuments(query);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const adminAllowed = ['pending', 'confirmed', 'cancelled'];
    if (!adminAllowed.includes(status))
      return res.status(400).json({ message: 'Admin can only set pending, confirmed or cancelled. Processing/Shipped/Delivered are managed by delivery team.' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user.name,
      note: note || `Status updated to ${status}`,
    });

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
    }

    await order.save();
    const updated = await Order.findById(order._id).populate('user', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignDelivery = async (req, res) => {
  try {
    const { deliveryUserId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: deliveryUserId,
        status: 'shipped',
        $push: {
          statusHistory: {
            status: 'shipped',
            updatedBy: req.user.name,
            note: 'Assigned to delivery agent',
          },
        },
      },
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User disabled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'delivery', isActive: true }).select('name email');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
