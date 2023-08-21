import * as entities from "../entities";
import { In, Repository } from "typeorm";
import dataSource from "../index";
import { BadRequest } from "@/utils/errors/custom-errors";

type CreateOptions = {
  user: entities.User;
  note: entities.Note;
  owner: boolean;
};

export default class CollaboratorRepository {
  private repository: Repository<entities.Collaborator>;

  constructor() {
    this.repository = dataSource.getRepository(entities.Collaborator);
  }

  async create({ user, note, owner }: CreateOptions): Promise<void> {
    const collaborator = await this.repository.create({ owner, user, note });
    await this.repository.save(collaborator);
  }

  async getCollaborator({
    userId,
    noteId,
  }: {
    userId: string;
    noteId: string;
  }): Promise<entities.Collaborator> {
    const collaborator = await this.repository.findOne({
      where: { user: { id: userId }, note: { id: noteId } },
    });

    return collaborator;
  }

  async getOwner(noteId): Promise<entities.Collaborator> {
    const collaborator = await this.repository.findOne({
      where: { note: { id: noteId }, owner: true },
      relations: ["user"],
    });
    return collaborator;
  }
  async remove(ids: string[]): Promise<void> {
    const { affected } = await this.repository.delete({
      id: In(ids),
      owner: false,
    });
    if (affected === 0) {
      throw new BadRequest({ message: "collaborator not found" });
    }
  }
}
