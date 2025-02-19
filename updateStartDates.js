const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./models/tourModel'); // Adjust the path as needed

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
    const result = await Tour.updateMany(
      {},
      {
        $set: {
          startDates: [
            { date: new Date('2025-06-01') },
            { date: new Date('2025-07-15') },
          ],
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully updated ${result.modifiedCount} tours.`);
    } else {
      console.log('⚠️ No tours were updated.');
    }
  } catch (err) {
    console.error('❌ Error updating startDates:', err);
  } finally {
    mongoose.connection.close();
  }
};

updateStartDates();
