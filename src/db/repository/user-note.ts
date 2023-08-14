import { Repository } from "typeorm";
import { UserNote } from "../entities";
import dataSource from "../index";
import { CreateUserNoteOption } from "./types";

class UserNoteRepository {
  private repository: Repository<UserNote>;

  constructor() {
    this.repository = dataSource.getRepository(UserNote);
  }

  async createUserNote(
    args: CreateUserNoteOption
  ): Promise<UserNote | undefined> {
    const userNote = await this.repository.create({ ...args });

    const userNoteObj = await this.repository.save(userNote);

    return userNoteObj;
  }
}

export default UserNoteRepository;
