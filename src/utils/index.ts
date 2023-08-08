import bcrypt from "bcryptjs";
import { ApiError } from "./errors/custom-errors";

export const createHashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new ApiError({
      message: "something bad happened",
      statusCode: 500,
    });
  }
};
