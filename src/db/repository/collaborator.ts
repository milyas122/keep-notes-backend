import * as entities from "../entities";
import { Repository } from "typeorm";
import dataSource from "../index";

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

  async create({ user, note, owner }): Promise<void> {
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
}
