import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
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

  @Column({ default: false })
  owner: boolean;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Note, (note) => note.userNote, { onDelete: "CASCADE" })
  note: Note;

  @ManyToMany(() => Label, { onDelete: "CASCADE" })
  @JoinTable()
  labels: Label[];
}
