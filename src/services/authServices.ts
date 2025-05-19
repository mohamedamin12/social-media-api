import { IUser, User } from "../models/usersModel";
import { TServiceResult } from "../types/serviceResult";
import appError from "../utils/appError";
import generateJwt from "../utils/generateJwt";
import httpStatusText from "../utils/httpStatusText";
import bcrypt from "bcrypt";


const registerService = async (registerData: {
  username: string;
  email: string;
  password: string;
  age: number;
  gender: string;
}): Promise<TServiceResult<IUser> & { token?: string }> => {
  const { username, email, password , age , gender} = registerData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = appError.create(
      "Email already in use",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    age,
    gender
  });

  // Generate JWT
  const token = await generateJwt({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  });

  return { token, type: "success" };
};


const loginService = async (loginData: {
  email: string;
  password: string;
}): Promise<TServiceResult<IUser> & { token?: string }> => {
  const { email, password } = loginData;
  const user = await User.findOne({ email }, { __v: 0 });
  if (!user) {
    const error = appError.create(
      "This user does not Exist",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const comparedPasswords = bcrypt.compareSync(password, user.password);
  if (!comparedPasswords) {
    const error = appError.create(
      "Invalid credentials",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  const token = await generateJwt({
    id: user._id,
    username: user.username,
    email,
    role: user.role,
  });
  return { token, type: "success" };
};

export default {
  registerService,
  loginService,
}