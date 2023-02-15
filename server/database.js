const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/sdc');
    console.log('MongoDB connected...');
  } catch (error) {
    console.log(`error: ${error}`);
    process.exit(1);
  }
};

const closeDB = () => {
  mongoose.connection.close();
};

module.exports = { connectDB, closeDB };
