import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsEmail } from "class-validator";

@Entity({ name: "users" })
export default class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  password: string;
}
