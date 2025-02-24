const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel'); // Adjust the path as needed

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => console.log('✅ DB Connection successful!'))
  .catch((err) => console.error('❌ DB Connection error:', err));

const updateStartDates = async () => {
  try {
    const result = await User.updateMany(
      { emailVerified: { $exists: false } }, // Only update users missing the field
      { $set: { emailVerified: true } }, // Mark existing users as verified
    );

    console.log(`${result.modifiedCount} users updated.`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating users:', err);
    mongoose.connection.close();
  }
};

updateStartDates();
