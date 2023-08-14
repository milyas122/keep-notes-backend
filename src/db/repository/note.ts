import { Repository } from "typeorm";
import { Note } from "../entities";
import dataSource from "../index";
import { CreateNoteOption } from "./types";

class NoteRepository {
  private repository: Repository<Note>;

  constructor() {
    this.repository = dataSource.getRepository(Note);
  }

  async createNote(args: CreateNoteOption): Promise<Note | undefined> {
    const note = await this.repository.create({ ...args });

    const noteObj = await this.repository.save(note);

    return noteObj;
  }
}

export default NoteRepository;
