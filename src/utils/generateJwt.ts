import jwt from "jsonwebtoken";
import dotenv from "dotenv";

type TGenerateJwt = {};
dotenv.config();

const generateJwt = async (payload: TGenerateJwt) => {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "JWT_SECRET_KEY is not defined in the environment variables."
    );
  }

  const token = await jwt.sign(payload, secretKey, {
    expiresIn: "30d",
  });

  return token;
};

export default generateJwt;