import { Reminder, UserNote } from "../entities";
import { Repository } from "typeorm";
import dataSource from "../index";

type CreateReminderOptions = {
  id: string;
  dateTime: Date;
  occurrence: number;
  userNote: UserNote;
};

export default class ReminderRepository {
  private repository: Repository<Reminder>;

  constructor() {
    this.repository = dataSource.getRepository(Reminder);
  }

  async create(args: CreateReminderOptions): Promise<void> {
    const reminder = await this.repository.create({ ...args });

    await this.repository.save(reminder);
  }
}
