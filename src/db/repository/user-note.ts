import { In, Repository } from "typeorm";
import { Label, UserNote, Note, User } from "../entities";
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

  async getDetailById(
    id: string,
    args: { userId?: string }
  ): Promise<UserNote> {
    const where = {
      id,
    };

    if (args?.userId) {
      where["user"] = { id: args.userId };
    }

    const userNote = await this.repository.findOne({
      where: { ...where },
      relations: {
        labels: true,
        note: {
          collaborators: { user: true },
          images: true,
          theme: true,
          noteList: { noteItemList: true },
        },
      },
      select: {
        id: true,
        archived: true,
        pined: true,
        note: {
          id: true,
          title: true,
          content: true,
          hasCheckBoxEnable: true,
          updatedAt: true,
          collaborators: {
            id: true,
            owner: true,
            userNoteId: true,
            user: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    });

    if (!userNote) {
      throw new BadRequest({ message: "note not found" });
    }

    return userNote;
  }

  async createBulk(args: CreateUserNoteOption[]): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(UserNote)
      .values(args)
      .execute();
  }

  async getUserNotes(userId: string, labelId?: string): Promise<UserNote[]> {
    let where = { where: {} };

    if (labelId) {
      where["where"] = { user: { id: userId }, labels: { id: labelId } };
    } else {
      where["where"] = { user: { id: userId } };
    }

    const notes = await this.repository.find({
      ...where,
      relations: {
        labels: true,
        note: {
          collaborators: { user: true },
          images: true,
          theme: true,
          noteList: { noteItemList: true },
        },
      },
      select: {
        id: true,
        archived: true,
        pined: true,
        note: {
          id: true,
          title: true,
          content: true,
          hasCheckBoxEnable: true,
          updatedAt: true,
          collaborators: {
            id: true,
            owner: true,
            userNoteId: true,
            user: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    });

    return notes;
  }

  async getByIds(userNoteIds: string[]): Promise<UserNote[]> {
    const userNoteList = await this.repository.find({
      where: { id: In(userNoteIds) },
      loadRelationIds: true,
    });

    if (userNoteList.length === 0) {
      throw new BadRequest({ message: "notes not found" });
    }

    return userNoteList;
  }

  async deleteByIds(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  async archiveNote(userId, ids: string[]): Promise<void> {
    const { affected } = await this.repository.update(
      { user: { id: userId }, note: { id: In(ids) } },
      { archived: true, pined: false }
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
      { pined: true, archived: false }
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
