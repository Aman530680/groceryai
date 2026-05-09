const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Products already seeded' });
    const products = [
      { name: 'Tomato', description: 'Fresh red tomatoes perfect for curries and salads.', price: 1.20, originalPrice: 1.50, category: 'vegetables', unit: 'kg', stock: 80, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', tags: ['vegetable', 'fresh', 'healthy'], isActive: true },
      { name: 'Potato', description: 'Farm fresh potatoes for daily cooking.', price: 0.99, originalPrice: 1.20, category: 'vegetables', unit: 'kg', stock: 120, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', tags: ['vegetable', 'staple'], isActive: true },
      { name: 'Onion', description: 'Fresh onions with rich flavor.', price: 1.10, originalPrice: 1.40, category: 'vegetables', unit: 'kg', stock: 100, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', tags: ['vegetable', 'cooking'], isActive: true },
      { name: 'Carrot', description: 'Crunchy orange carrots rich in vitamins.', price: 1.50, originalPrice: 1.80, category: 'vegetables', unit: 'kg', stock: 70, image: 'https://images.unsplash.com/photo-1447175008436-170170753d52?w=400', tags: ['vegetable', 'healthy'], isActive: true },
      { name: 'Cabbage', description: 'Fresh green cabbage for salads and stir fry.', price: 1.30, originalPrice: 1.60, category: 'vegetables', unit: 'piece', stock: 50, image: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?w=400', tags: ['vegetable', 'green'], isActive: true },
      { name: 'Apple', description: 'Fresh red apples full of sweetness.', price: 2.99, originalPrice: 3.49, category: 'fruits', unit: 'kg', stock: 90, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', tags: ['fruit', 'fresh'], isActive: true },
      { name: 'Banana', description: 'Naturally sweet ripe bananas.', price: 1.50, originalPrice: 1.80, category: 'fruits', unit: 'dozen', stock: 60, image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=400', tags: ['fruit', 'healthy'], isActive: true },
      { name: 'Orange', description: 'Juicy oranges rich in Vitamin C.', price: 2.20, originalPrice: 2.70, category: 'fruits', unit: 'kg', stock: 75, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', tags: ['fruit', 'juice'], isActive: true },
      { name: 'Milk', description: 'Pure fresh cow milk.', price: 1.10, originalPrice: 1.30, category: 'dairy', unit: 'liter', stock: 100, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', tags: ['dairy', 'fresh'], isActive: true },
      { name: 'Cheese', description: 'Creamy mozzarella cheese block.', price: 4.99, originalPrice: 5.99, category: 'dairy', unit: 'pack', stock: 40, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', tags: ['dairy', 'cheese'], isActive: true },
      { name: 'Chicken Breast', description: 'Fresh boneless chicken breast.', price: 6.99, originalPrice: 7.99, category: 'meat', unit: 'kg', stock: 45, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', tags: ['meat', 'protein'], isActive: true },
      { name: 'Mutton', description: 'Fresh tender goat meat.', price: 10.99, originalPrice: 12.99, category: 'meat', unit: 'kg', stock: 25, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', tags: ['meat', 'fresh'], isActive: true },
      { name: 'Salmon Fish', description: 'Premium fresh salmon fish.', price: 12.99, originalPrice: 14.99, category: 'seafood', unit: 'kg', stock: 20, image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400', tags: ['seafood', 'fish'], isActive: true },
      { name: 'Prawns', description: 'Fresh tiger prawns.', price: 9.99, originalPrice: 11.99, category: 'seafood', unit: 'kg', stock: 30, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', tags: ['seafood', 'protein'], isActive: true },
      { name: 'Basmati Rice', description: 'Premium long grain basmati rice.', price: 2.99, originalPrice: 3.99, category: 'grains', unit: 'kg', stock: 100, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', tags: ['rice', 'grains'], isActive: true },
      { name: 'Wheat Flour', description: 'Organic wheat flour for chapati.', price: 1.99, originalPrice: 2.49, category: 'grains', unit: 'kg', stock: 80, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', tags: ['grain', 'flour'], isActive: true },
      { name: 'Turmeric Powder', description: 'Pure organic turmeric powder.', price: 1.50, originalPrice: 1.90, category: 'spices', unit: '100g', stock: 70, image: 'https://images.unsplash.com/photo-1615485925873-98f8f9c8c63f?w=400', tags: ['spice', 'indian'], isActive: true },
      { name: 'Black Pepper', description: 'Premium black pepper seeds.', price: 2.50, originalPrice: 3.00, category: 'spices', unit: '100g', stock: 60, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', tags: ['spice', 'seasoning'], isActive: true },
      { name: 'Orange Juice', description: 'Freshly squeezed orange juice.', price: 2.20, originalPrice: 2.80, category: 'beverages', unit: 'liter', stock: 50, image: 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?w=400', tags: ['juice', 'drink'], isActive: true },
      { name: 'Cold Coffee', description: 'Refreshing chilled coffee drink.', price: 3.50, originalPrice: 4.20, category: 'beverages', unit: 'cup', stock: 35, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400', tags: ['coffee', 'drink'], isActive: true },
      { name: 'Potato Chips', description: 'Crispy salted potato chips.', price: 1.20, originalPrice: 1.50, category: 'snacks', unit: 'pack', stock: 90, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', tags: ['snack', 'crispy'], isActive: true },
      { name: 'Chocolate Cookies', description: 'Crunchy chocolate chip cookies.', price: 2.99, originalPrice: 3.49, category: 'snacks', unit: 'box', stock: 55, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', tags: ['cookies', 'snack'], isActive: true },
      { name: 'Honey', description: 'Natural organic honey.', price: 5.99, originalPrice: 6.99, category: 'other', unit: 'bottle', stock: 25, image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400', tags: ['organic', 'sweet'], isActive: true },
      { name: 'Peanut Butter', description: 'Creamy peanut butter spread.', price: 4.20, originalPrice: 5.00, category: 'other', unit: 'jar', stock: 40, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', tags: ['spread', 'protein'], isActive: true },
    ];
    await Product.insertMany(products);
    res.json({ message: `${products.length} products seeded successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
