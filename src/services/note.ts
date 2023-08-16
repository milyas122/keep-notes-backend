import { CreateNoteOptions } from "./types";
import { ApiError, BadRequest } from "@/utils/errors/custom-errors";
import * as repository from "@/db/repository";
import * as repoType from "@/db/repository/types";

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

    if (args?.label) {
      const labelObj = await this.labelRepo.getLabel({
        name: args.label,
        userId,
      });
      labelObj && (userNoteArgs.label = labelObj);
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
}

export { NoteService };
