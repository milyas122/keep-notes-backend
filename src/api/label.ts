import { Request, Response } from "express";
import { errorHandler } from "@/utils/errors";
import { validate } from "@/utils/validations";
import { User } from "@/db/entities";
import * as schema from "@/utils/validations/label";
import { LabelService } from "@/services/label";

const service = new LabelService();

export async function createLabel(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { name } = await validate(schema.labelSchema, req.body);

    await service.createLabel(userId, name);

    return res.status(200).json({ message: "label created successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "CreateNote" });
  }
}
