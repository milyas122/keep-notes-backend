import UserService from "@/services/user.services";
import { Request, Response } from "express";
import { errorHandler } from "@/utils/errors";
import { userSchema } from "@/utils/validations/user.validation";
import { validate } from "@/utils/validations";

const service = new UserService();

async function userSignup(req: Request, res: Response): Promise<Response> {
  try {
    const cleanedFields = await validate(userSchema, req.body);
    await service.Signup({ ...cleanedFields });
    return res.status(201).json({ message: "user created successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "UserSignup" });
  }
}

export default { userSignup };
