const User = require('../models/User');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate('cart.product');
    res.json(updated.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMissingIngredients = async (req, res) => {
  try {
    const { ingredients } = req.body; // array of ingredient names
    const user = await User.findById(req.user._id);
    const added = [];

    for (const name of ingredients) {
      const product = await Product.findOne({
        name: { $regex: name, $options: 'i' },
        isActive: true,
        stock: { $gt: 0 },
      });
      if (product) {
        const exists = user.cart.find((i) => i.product.toString() === product._id.toString());
        if (!exists) {
          user.cart.push({ product: product._id, quantity: 1 });
          added.push(product.name);
        }
      }
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate('cart.product');
    res.json({ cart: updated.cart, added });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    const updated = await User.findById(req.user._id).populate('cart.product');
    res.json(updated.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
