import { NoteList } from "../entities";
import dataSource from "../index";
import { Repository } from "typeorm";
import NoteListItemRepository from "./note-list-item";

const listItemRepo = new NoteListItemRepository();

type BaseNote = {
  content: string;
  isCompleted: boolean;
  order: number;
};

type NoteListItems = {
  hasItems: true;
  noteItemList: BaseNote[];
};

type CreateNoteListOption = BaseNote & ({ hasItems: false } | NoteListItems);

class NoteListRepository {
  private repository: Repository<NoteList>;

  constructor() {
    this.repository = dataSource.getRepository(NoteList);
  }

  async createNoteList(args: CreateNoteListOption[]): Promise<NoteList[]> {
    const noteList = await Promise.all(
      args.map(async (note) => {
        const noteObj = {
          content: note.content,
          order: note.order,
          isCompleted: note.isCompleted,
          hasItems: note.hasItems,
        };
        if (note.hasItems && note.noteItemList.length > 0) {
          const items = await listItemRepo.createNoteListItems(
            note.noteItemList
          );

          noteObj["noteItemList"] = items;
        }
        return noteObj;
      })
    );
    const result = await this.repository.save(noteList);

    return result;
  }
}

export default NoteListRepository;
