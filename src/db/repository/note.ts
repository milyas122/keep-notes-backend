import { Repository } from "typeorm";
import { Note } from "../entities";
import dataSource from "../index";
import NoteImageRepository from "./note-image";
import NoteListRepository from "./note-list";
import ThemeRepository from "./theme";
import { CreateNoteOptions } from "../types";

const noteImageRepo = new NoteImageRepository();
const noteListRepo = new NoteListRepository();
const themeRepo = new ThemeRepository();

class NoteRepository {
  private repository: Repository<Note>;

  constructor() {
    this.repository = dataSource.getRepository(Note);
  }

  async createNote(args: CreateNoteOptions): Promise<Note | undefined> {
    const note = new Note();

    args?.title && (note.title = args.title);

    note.hasCheckBoxEnable = args.hasCheckBoxEnable;

    if (args?.imageUrls && args?.imageUrls.length > 0) {
      note.images = await noteImageRepo.getImages(args.imageUrls);
    }

    if (args?.theme) {
      note.theme = await themeRepo.getTheme({ color: args.theme });
    }

    if (args.hasCheckBoxEnable) {
      const noteListObj = await noteListRepo.createNoteList(args.noteList);
      noteListObj && (note.noteList = noteListObj);
    } else if (args.hasCheckBoxEnable === false) {
      args?.content && (note.content = args.content);
    }

    const noteObj = await this.repository.save(note);

    return noteObj;
  }
}

export default NoteRepository;
