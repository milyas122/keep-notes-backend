import { Repository } from "typeorm";
import { Note } from "../entities";
import dataSource from "../index";
import { CreateNoteOption } from "./types";
import { BadRequest } from "@/utils/errors/custom-errors";
import UserNoteRepository from "./user-note";

class NoteRepository {
  private repository: Repository<Note>;
  private userNoteRepo: UserNoteRepository;

  constructor() {
    this.repository = dataSource.getRepository(Note);
    this.userNoteRepo = new UserNoteRepository();
  }

  async createNote(args: CreateNoteOption): Promise<Note | undefined> {
    const note = await this.repository.create({ ...args });

    const noteObj = await this.repository.save(note);

    return noteObj;
  }

  async getNoteById(id: string): Promise<Note> {
    const note = await this.repository.findOne({
      where: {
        id,
      },
      relations: ["noteList", "noteList.noteItemList", "images", "theme"],
    });

    if (!note) {
      throw new BadRequest({ message: "note not found" });
    }
    return note;
  }

  async deleteNote(ids: string[]): Promise<void> {
    const { affected } = await this.repository.delete(ids);
    if (affected === 0) {
      throw new BadRequest({ message: "note not found" });
    }
  }
}

export default NoteRepository;
