import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column("text", { nullable: true })
  address?: string;

  @Column("text", { nullable: true })
  password?: string;

  @Column("int", { default: 0 })
  tokenVersion!: number;
}

export default User;
