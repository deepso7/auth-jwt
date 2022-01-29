import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";

import User from "./entity/User";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field(() => String)
  accessToken!: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hi!";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log({ payload });
    return `Bye user id: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<Boolean> {
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

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error("User not found");

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error("Invalid password");

    // loginc successfull, add refresh token in cookie
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }
}
