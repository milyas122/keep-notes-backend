import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import User from "./user";
import UserNote from "./user-note";

@Entity({ name: "label" })
export default class Label {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @OneToMany(() => UserNote, (userNote) => userNote.label)
  userNotes: UserNote[];

  @ManyToOne(() => User, (user) => user.labels)
  user: User;
}
