const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.set('strictQuery', false);

const dbUrl = process.env.MONGODB_URL;

const connectWithRetry = () => {
  if (!dbUrl) {
    console.error('MONGODB_URL is not defined in environment variables');
    process.exit(1);
  }

  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('Connexion à MongoDB réussie');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    console.log('Nouvelle tentative dans 5 secondes...');
    setTimeout(connectWithRetry, 5000);
  });
};

module.exports = connectWithRetry;
