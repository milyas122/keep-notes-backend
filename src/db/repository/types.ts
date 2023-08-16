import * as entity from "../entities";

export type CreateUserNoteOption = {
  pined: boolean;
  user: entity.User;
  label?: entity.Label;
  note: entity.Note;
  owner: boolean;
};

type SimpleNote = {
  hasCheckBoxEnable: false;
  content: string;
};

type NoteList = {
  hasCheckBoxEnable: true;
  noteList: entity.NoteList[];
};

type BaseNote = {
  content: string;
  isCompleted: boolean;
  order: number;
};

type NoteListItems = {
  hasItems: true;
  noteItemList: BaseNote[];
};

export type CreateNoteListOption = BaseNote &
  ({ hasItems: false } | NoteListItems);

export type CreateNoteOption = {
  title?: string;
  images?: entity.NoteImage[];
  theme?: entity.Theme;
} & (SimpleNote | NoteList);
