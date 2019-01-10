const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }
  console.log('=> using new database connection');
  return mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    // console.log(err);
    throw (err);
  });
};

export default connectToDatabase;
