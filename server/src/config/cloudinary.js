import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnbayngfx',
  api_key: process.env.CLOUDINARY_API_KEY || '173135536924842',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'JWcBL0l7ZU_9y6_ULjBfxoVYOA4',
  secure: true
});

export default cloudinary;
