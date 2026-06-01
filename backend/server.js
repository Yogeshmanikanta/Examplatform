import app from './src/app.js';
import './src/config/db.js';
import dotenv from 'dotenv';
import cors from "cors";
dotenv.config();
process.env.TimeZone = 'UTC';
const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
});