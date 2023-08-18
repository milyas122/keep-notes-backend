import { Response, Request } from "express";
import { errorHandler } from "@/utils/errors";
import { validate } from "@/utils/validations";
import * as schema from "@/utils/validations/note";
import { NoteService } from "@/services/note";
import { User } from "@/db/entities";

const service = new NoteService();

export async function createNote(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;

    const cleanedFields = await validate(schema.noteSchema, req.body);

    await service.createNote(userId, cleanedFields);

    return res.status(200).json({ message: "note created successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "CreateNote" });
  }
}

export async function deleteNotes(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { noteIds } = await validate(schema.deleteNoteSchema, req.body);

    await service.deleteNotes(userId, noteIds);
    return res.status(200).json({ message: "notes deleted successfully" });
  } catch (error) {
    console.log(error);
    return errorHandler(res, error, { logKey: "DeleteNotes" });
  }
}

export async function archiveNotes(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { noteIds } = await validate(schema.archiveNotesSchema, req.body);

    await service.archiveNotes(userId, noteIds);

    return res.status(200).json({ message: "notes archived successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "ArchiveNote" });
  }
}

export async function unArchiveNotes(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { noteIds } = await validate(schema.unArchiveNotesSchema, req.body);

    await service.unArchiveNotes(userId, noteIds);

    return res
      .status(200)
      .json({ message: "notes are unArchived successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "UnArchiveNote" });
  }
}

export async function pinNotes(req: Request, res: Response): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { noteIds } = await validate(schema.pinNotesSchema, req.body);

    await service.pinNotes(userId, noteIds);

    return res.status(200).json({ message: "notes are pinned successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "PinNotes" });
  }
}

export async function unPinNotes(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const { noteIds } = await validate(schema.unPinNotesSchema, req.body);

    await service.unPinNotes(userId, noteIds);

    return res.status(200).json({ message: "notes are unpinned successfully" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "PinNotes" });
  }
}

export async function changeNotesLabel(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = (req.user as User).id;
    const cleanedFields = await validate(
      schema.changeNoteLabelSchema,
      req.body
    );

    await service.changeNotesLabel(userId, cleanedFields);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return errorHandler(res, error, { logKey: "ChangeNotesLabel" });
  }
}
