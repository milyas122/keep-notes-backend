import { In, Repository } from "typeorm";
import { UserNote } from "../entities";
import dataSource from "../index";
import { CreateUserNoteOption } from "./types";
import { BadRequest } from "@/utils/errors/custom-errors";

type GetByNoteIdsAndUserIdOptions = {
  userNote_id: string;
  user_id: string;
  userNote_owner: number;
  note_id: string;
};

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

  async getByUserIdAndNoteIds(
    userId: string,
    noteIds: string[]
  ): Promise<GetByNoteIdsAndUserIdOptions[]> {
    const userNoteList = await this.repository
      .createQueryBuilder("userNote")
      .leftJoinAndSelect("userNote.note", "note")
      .leftJoinAndSelect("userNote.user", "user")
      .where("note.id IN (:...noteIds)", { noteIds })
      .andWhere("user.id = :userId", { userId })
      .select(["userNote.id", "userNote.owner", "user.id", "note.id"])
      .orderBy("userNote.owner", "DESC")
      .getRawMany();

    return userNoteList;
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  async archiveNote(userId, ids: string[]): Promise<void> {
    const { affected } = await this.repository.update(
      { user: { id: userId }, note: { id: In(ids) } },
      { archived: true }
    );

    if (affected === 0) {
      throw new BadRequest({ message: "notes not found" });
    }
  }
}

export default UserNoteRepository;
