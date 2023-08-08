import { BadRequest } from "../errors/custom-errors";

async function validate(schema, fields) {
  try {
    return await schema.validate(fields, { stripUnknown: true });
  } catch (e) {
    throw new BadRequest({ message: e.message });
  }
}

export { validate };
