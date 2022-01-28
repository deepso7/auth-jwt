import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  // @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  // @Field()
  @Column("text")
  email!: string;

  @Column("text")
  password!: string;

  @Column("int", { default: 0 })
  tokenVersion!: number;
}

export default User;
