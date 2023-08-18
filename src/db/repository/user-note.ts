import { In, Index, Repository } from "typeorm";
import { Label, UserNote } from "../entities";
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

  async unArchiveNote(userId, ids: string[]): Promise<void> {
    const { affected } = await this.repository.update(
      { user: { id: userId }, note: { id: In(ids) } },
      { archived: false }
    );

    if (affected === 0) {
      throw new BadRequest({ message: "notes not found" });
    }
  }

  async pinNotes(userId, ids: string[]): Promise<void> {
    const { affected } = await this.repository.update(
      { user: { id: userId }, note: { id: In(ids) } },
      { pined: true }
    );

    if (affected === 0) {
      throw new BadRequest({ message: "notes not found" });
    }
  }

  async unPinNotes(userId, ids: string[]): Promise<void> {
    const { affected } = await this.repository.update(
      { user: { id: userId }, note: { id: In(ids) } },
      { pined: false }
    );

    if (affected === 0) {
      throw new BadRequest({ message: "notes not found" });
    }
  }

  async changeNotesLabels(
    userId: string,
    args: { label: Label; noteIds: string[]; selected: boolean }
  ): Promise<void> {
    const userNotes = await this.repository.find({
      where: { user: { id: userId }, note: { id: In(args.noteIds) } },
      relations: {
        labels: true,
      },
      select: ["id"],
    });

    let labelIndex: number;

    let done = false;

    userNotes.forEach((item) => {
      // check provided label is associated or not?
      const associated = item.labels.find((label, index) => {
        labelIndex = index;
        return label.id === args.label.id;
      });

      !associated &&
        args.selected &&
        item.labels.push(args.label) &&
        (done = true);

      associated &&
        !args.selected &&
        item.labels.splice(labelIndex) &&
        (done = true);
    });

    done && (await this.repository.save(userNotes));
  }
}

export default UserNoteRepository;
