import { Repository } from "typeorm";
import { UserNote } from "../entities";
import dataSource from "../index";
import { CreateNoteOptions } from "../types";
import NoteRepository from "./note";
import UserRepository from "./user";
import LabelRepository from "./label";
import { ApiError, BadRequest } from "@/utils/errors/custom-errors";

const noteRepo = new NoteRepository();
const userRepo = new UserRepository();
const labelRepo = new LabelRepository();

class UserNoteRepository {
  private repository: Repository<UserNote>;

  constructor() {
    this.repository = dataSource.getRepository(UserNote);
  }

  async createUserNote(
    userId: string,
    args: CreateNoteOptions
  ): Promise<UserNote | undefined> {
    const userNote = new UserNote();

    userNote.pined = args.pined;

    if (args?.label) {
      const labelObj = await labelRepo.getLabel({ name: args.label, userId });
      labelObj && (userNote.label = labelObj);
    }

    const userObj = await userRepo.findUser({ id: userId });

    if (!userObj) throw new BadRequest({ message: "user not exist" });

    userNote.user = userObj;

    const note = await noteRepo.createNote(args);

    if (!note) throw new ApiError({ message: "something bad happened .." });

    userNote.note = note;

    const userNoteObj = await this.repository.save(userNote);
    return userNoteObj;
  }
}

export default UserNoteRepository;
