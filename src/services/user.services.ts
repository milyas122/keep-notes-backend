import UserRepository from "@/db/repository/user-repo";
import { BadRequest } from "@/utils/errors/custom-errors";
import { createHashPassword } from "@/utils";

interface SignupArgs {
  email: string;
  password: string;
  name: string;
}

class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async Signup({ email, password, name }: SignupArgs): Promise<void> {
    const isUser = await this.repository.findUser({ email });
    if (isUser) {
      throw new BadRequest({
        message: "this email is already registered",
        statusCode: 400,
      });
    }

    const hash = await createHashPassword(password);

    await this.repository.createUser({ email, password: hash, name });
  }
}

export default UserService;
