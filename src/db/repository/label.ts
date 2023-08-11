import { Label } from "../entities";
import dataSource from "../index";
import { Repository } from "typeorm";
import UserRepository from "./user";
import { ApiError } from "@/utils/errors/custom-errors";

type FindLabelOption = {
  id?: string;
  name?: string;
  userId?: string;
};

const userRepo = new UserRepository();

class LabelRepository {
  private repository: Repository<Label>;

  constructor() {
    this.repository = dataSource.getRepository(Label);
  }

  async getLabel(args: FindLabelOption): Promise<Label | undefined> {
    const where = {};

    if (args?.id) {
      where["id"] = args.id;
    } else if (args?.name) {
      where["name"] = args.name;
      where["user"] = { id: args.userId };
    }

    const label = await this.repository.findOne({ where });

    return label;
  }

  async createLabel(args: { userId: string; name: string }): Promise<void> {
    const { userId, name } = args;
    const isExist = await this.getLabel({ userId, name });

    if (!isExist) {
      const user = await userRepo.findUser({ id: userId });

      if (!user) throw new ApiError({ message: "user not exist" });

      const newLabel = await this.repository.create({ name, user });

      await this.repository.save(newLabel);
    }
  }
}

export default LabelRepository;
