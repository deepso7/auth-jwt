import { Arg, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import User from "./entity/User";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hi!";
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const hashedPassword = await argon2.hash(password);
      await User.insert({
        email,
        password: hashedPassword,
      });

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
