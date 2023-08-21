import { CreateNoteOptions } from "./types";
import { ApiError, BadRequest } from "@/utils/errors/custom-errors";
import * as repository from "@/db/repository";
import * as repoType from "@/db/repository/types";
import { UserNote } from "@/db/entities";

class NoteService {
  private userNoteRepo: repository.UserNoteRepository;
  private noteRepo: repository.NoteRepository;
  private labelRepo: repository.LabelRepository;
  private userRepo: repository.UserRepository;
  private imageRepo: repository.NoteImageRepository;
  private themeRepo: repository.ThemeRepository;
  private noteListRepo: repository.NoteListRepository;

  constructor() {
    this.userNoteRepo = new repository.UserNoteRepository();
    this.noteRepo = new repository.NoteRepository();
    this.labelRepo = new repository.LabelRepository();
    this.userRepo = new repository.UserRepository();
    this.imageRepo = new repository.NoteImageRepository();
    this.themeRepo = new repository.ThemeRepository();
    this.noteListRepo = new repository.NoteListRepository();
  }

  async createNote(
    userId: string,
    args: CreateNoteOptions
  ): Promise<void | undefined> {
    const userNoteArgs = {} as repoType.CreateUserNoteOption;
    const noteArgs = {} as repoType.CreateNoteOption;

    userNoteArgs.pined = args.pined;

    if (args?.labels && args.labels.length > 0) {
      const labels = await this.labelRepo.getLabelsByIds(userId, args.labels);
      labels && (userNoteArgs.labels = labels);
    }

    const userObj = await this.userRepo.findUser({ id: userId });

    if (!userObj) throw new BadRequest({ message: "user not exist" });
    userNoteArgs.user = userObj;

    noteArgs["hasCheckBoxEnable"] = args.hasCheckBoxEnable;
    args?.title && (noteArgs.title = args.title);

    if (args?.imageUrls && args.imageUrls.length > 0) {
      noteArgs.images = await this.imageRepo.getImages(args.imageUrls);
    }

    if (args?.theme) {
      noteArgs.theme = await this.themeRepo.getTheme({ color: args.theme });
    }
    noteArgs.hasCheckBoxEnable = args.hasCheckBoxEnable;
    if (args.hasCheckBoxEnable === true) {
      noteArgs["noteList"] = await this.noteListRepo.createNoteList(
        args.noteList
      );
    } else if (args.hasCheckBoxEnable === false) {
      noteArgs["content"] = args.content;
    }

    const note = await this.noteRepo.createNote(noteArgs);

    if (!note) throw new ApiError({ message: "something bad happened .." });
    userNoteArgs.note = note;
    userNoteArgs.owner = true; // Help to find an owner of the note

    await this.userNoteRepo.createUserNote({ ...userNoteArgs });
  }

  async getUserNoteList(userId: string, labelName?: string): Promise<any> {
    let labelId;

    if (labelName) {
      const label = await this.labelRepo.getLabel({
        name: labelName,
        userId,
        select: ["id"],
      });

      if (!label) throw new BadRequest({ message: "label not found" });

      labelId = label?.id;
    }

    const userNotes = await this.userNoteRepo.getUserNotes(userId, labelId);

    const notes = {
      pined: [],
      notes: [],
      archived: [],
    };
    userNotes.forEach((item) => {
      const obj = {
        id: item.note.id,
        archived: item.archived,
        pined: item.pined,
        labels: item.labels,
        ...item.note,
      };

      if (item.archived && labelName) {
        notes["archived"].push(obj);
      } else if (item.pined && labelName) {
        notes["pined"].push(obj);
      } else {
        notes["notes"].push(obj);
      }
    });
    return notes;
  }

  async deleteNotes(userId: string, ids: string[]): Promise<void> {
    const userNoteList = await this.userNoteRepo.getByUserIdAndNoteIds(
      userId,
      ids
    );

    const userNoteIds = [];
    const noteIds = [];

    for (const item of userNoteList) {
      if (item.userNote_owner === 1) {
        noteIds.push(item.note_id);
      } else if (item.userNote_owner === 0) {
        userNoteIds.push(item.userNote_id);
      }
    }

    if (noteIds.length > 0) {
      await this.noteRepo.deleteNote(noteIds);
    }

    if (userNoteIds.length > 0) {
      await this.userNoteRepo.deleteByIds(userNoteIds);
    }
  }

  async archiveNotes(userId: string, noteIds: string[]): Promise<void> {
    await this.userNoteRepo.archiveNote(userId, noteIds);
  }

  async unArchiveNotes(userId: string, noteIds: string[]): Promise<void> {
    await this.userNoteRepo.unArchiveNote(userId, noteIds);
  }

  async pinNotes(userId: string, noteIds: string[]): Promise<void> {
    await this.userNoteRepo.pinNotes(userId, noteIds);
  }

  async unPinNotes(userId: string, noteIds: string[]): Promise<void> {
    await this.userNoteRepo.unPinNotes(userId, noteIds);
  }

  async changeNotesLabel(
    userId: string,
    args: { label: string; noteIds: string[]; selected: boolean }
  ): Promise<void> {
    const label = await this.labelRepo.getLabel({ id: args.label });

    if (!label) throw new BadRequest({ message: "label not found" });

    await this.userNoteRepo.changeNotesLabels(userId, {
      label,
      noteIds: args.noteIds,
      selected: args.selected,
    });
  }

  async addCollaborator(
    collaboratorEmail: string,
    noteId: string,
    userId: string
  ): Promise<void> {
    const user = await this.userRepo.findUser({ email: collaboratorEmail });

    if (!user) throw new BadRequest({ message: "user not found" });

    if (userId === user.id)
      throw new BadRequest({
        message: "you can't add yourself as a collaborator",
      });

    const note = await this.noteRepo.getNoteById(noteId);

    if (!note) throw new BadRequest({ message: "note not found" });

    const userNote = await this.userNoteRepo.getByUserIdAndNoteIds(user.id, [
      note.id,
    ]);

    if (userNote[0].user_id !== user.id) {
      await this.userNoteRepo.createUserNote({
        owner: false,
        pined: false,
        user: user,
        note: note,
      });
    }
  }
}

export { NoteService };
