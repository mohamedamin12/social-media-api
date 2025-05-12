import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Request } from "express";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Define the Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    // @ts-ignore
    folder: "social-media",
    format: async (
      req: Request,
      file: Express.Multer.File
    ): Promise<string> => {
      const fileFormat = file.mimetype.split("/")[1];
      return ["jpeg", "jpg", "png", "gif", "webp"].includes(fileFormat)
        ? fileFormat
        : "jpg";
    },
    public_id: (req: Request, file: Express.Multer.File): string => {
      return file.originalname.split(".")[0];
    },
  },
});

// Initialize Multer
const upload = multer({ storage });

export default upload;