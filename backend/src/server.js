'use strict';

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[RedFlow Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('[RedFlow Backend] Failed to connect to database:', err);
});
