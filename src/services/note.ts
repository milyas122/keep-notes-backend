import { CreateNoteOptions } from "./types";
import { ApiError, BadRequest } from "@/utils/errors/custom-errors";
import * as repository from "@/db/repository";
import * as repoType from "@/db/repository/types";
import { v4 as uuidv4 } from "uuid";
import { UserNote } from "@/db/entities";

class NoteService {
  private userNoteRepo: repository.UserNoteRepository;
  private noteRepo: repository.NoteRepository;
  private labelRepo: repository.LabelRepository;
  private userRepo: repository.UserRepository;
  private imageRepo: repository.NoteImageRepository;
  private themeRepo: repository.ThemeRepository;
  private noteListRepo: repository.NoteListRepository;
  private collaboratorRepo: repository.CollaboratorRepository;

  constructor() {
    this.userNoteRepo = new repository.UserNoteRepository();
    this.noteRepo = new repository.NoteRepository();
    this.labelRepo = new repository.LabelRepository();
    this.userRepo = new repository.UserRepository();
    this.imageRepo = new repository.NoteImageRepository();
    this.themeRepo = new repository.ThemeRepository();
    this.noteListRepo = new repository.NoteListRepository();
    this.collaboratorRepo = new repository.CollaboratorRepository();
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

    const userNoteId = uuidv4();
    await this.collaboratorRepo.create({
      note,
      user: userObj,
      owner: true,
      userNoteId,
    });

    await this.userNoteRepo.createUserNote({ id: userNoteId, ...userNoteArgs });
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
      if (item.archived) {
        notes["archived"].push(item);
      } else if (item.pined) {
        notes["pined"].push(item);
      } else {
        notes["notes"].push(item);
      }
    });
    return notes;
  }

  async getNote(userId: string, userNoteId: string): Promise<UserNote> {
    const note = await this.userNoteRepo.getDetailById(userNoteId, { userId });
    note.note.collaborators = note.note.collaborators.filter((item) => {
      if (item.user.id !== userId) {
        return true;
      }
    });
    return note;
  }

  async deleteNotes(userNoteIds: string[]): Promise<void> {
    const userNoteList = await this.userNoteRepo.getByIds(userNoteIds);

    const noteIds = [];

    userNoteList.forEach((item) => {
      if (item.owner === true) {
        noteIds.push(item.note);
        userNoteIds.splice(userNoteIds.indexOf(item.id), 1);
      }
    });

    if (noteIds.length > 0) {
      await this.noteRepo.deleteNote(noteIds);
    }

    if (userNoteIds.length > 0) {
      await this.userNoteRepo.deleteByIds(userNoteIds);
      await this.collaboratorRepo.removeByUserNoteIds(userNoteIds);
    }
  }

  async archiveNotes(userId: string, userNoteIds: string[]): Promise<void> {
    await this.userNoteRepo.archiveNote(userId, userNoteIds);
  }

  async unArchiveNotes(userId: string, userNoteIds: string[]): Promise<void> {
    await this.userNoteRepo.unArchiveNote(userId, userNoteIds);
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

  // addCollaborators
  async addCollaborator(
    currentUser: string,
    collaboratorEmails: string[],
    noteId: string
  ): Promise<void> {
    const users = await this.userRepo.findUsers(collaboratorEmails);

    if (!users) throw new BadRequest({ message: "users not found" });

    const note = await this.noteRepo.getNoteById(noteId);

    if (!note) throw new BadRequest({ message: "note not found" });

    const collaborators = note.collaborators;

    let isAllow = false;

    const added = collaborators.map((user) => {
      if (user.user.id === currentUser) {
        isAllow = true;
      }
      return user.user.email;
    });

    if (!isAllow) {
      throw new BadRequest({
        message: "your are not allowed to add collaborators",
      });
    }

    const newUserNotes = [];
    const newCollaborators = users
      .filter((user) => !added.includes(user.email))
      .map((user) => {
        const userNoteId = uuidv4();

        if (!added.includes(user.email)) {
          newUserNotes.push({
            id: userNoteId,
            owner: false,
            pined: false,
            user: user,
            note: note,
            archived: false,
          });
          return { user, note, owner: false, userNoteId: userNoteId };
        }
      });

    if (newCollaborators.length > 0) {
      await this.collaboratorRepo.createBulk(newCollaborators);
      await this.userNoteRepo.createBulk(newUserNotes);
    }
  }

  async removeCollaborator(
    noteId: string,
    collaboratorIds: string[]
  ): Promise<void> {
    const owner = await this.collaboratorRepo.getOwner(noteId);

    collaboratorIds.includes(owner.id) &&
      collaboratorIds.splice(collaboratorIds.indexOf(owner.id), 1); // restrict to remove owner from collaborator

    if (collaboratorIds.length > 0) {
      const collaborators = await this.collaboratorRepo.getCollaborators(
        collaboratorIds
      );
      const userNoteIds = collaborators.map((collaborator) => {
        return collaborator.userNoteId;
      });

      await this.collaboratorRepo.remove(collaboratorIds);
      await this.userNoteRepo.deleteByIds(userNoteIds);
    }
  }
}

export { NoteService };
