export type BaseNoteItem = {
  content: string;
  isCompleted: boolean;
  order: number;
};

export type NoteItemsList = {
  hasItems: true;
  noteItemList: BaseNoteItem[];
};

export type NoteList = BaseNoteItem & ({ hasItems: false } | NoteItemsList);

export type CreateNoteList = {
  hasCheckBoxEnable: true;
  noteList: NoteList[];
};

export type CreateSimpleNote = {
  hasCheckBoxEnable: false;
  content: string;
};

export type CreateNoteOptions = {
  title?: string;
  imageUrls?: string[];
  theme?: string;
  pined?: boolean;
  label?: string;
} & (CreateSimpleNote | CreateNoteList);
