import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";
import Note from "./note";
import Label from "./label";

@Entity({ name: "userNote" })
export default class UserNote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  pined: boolean;

  @ManyToOne(() => User, (user) => user.notes)
  user: User;

  @ManyToOne(() => Note, (note) => note.userNote)
  note: Note;

  @ManyToOne(() => Label)
  @JoinColumn()
  label: Label;
}
