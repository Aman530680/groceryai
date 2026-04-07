require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Remove existing special accounts
  await User.deleteMany({ email: { $in: ['aman123@groceryai.com', 'delivery123@groceryai.com'] } });

  // Create admin
  const admin = await User.create({
    name: 'aman123',
    email: 'aman123@groceryai.com',
    password: 'aman123',
    role: 'admin',
    isActive: true,
  });

  // Create delivery user
  const delivery = await User.create({
    name: 'delivery123',
    email: 'delivery123@groceryai.com',
    password: 'delivery123',
    role: 'delivery',
    isActive: true,
  });

  console.log('✅ Admin created:');
  console.log('   Email   : aman123@groceryai.com');
  console.log('   Password: aman123');
  console.log('   Role    : admin');
  console.log('');
  console.log('✅ Delivery user created:');
  console.log('   Email   : delivery123@groceryai.com');
  console.log('   Password: delivery123');
  console.log('   Role    : delivery');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
