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
import { ethers } from "ethers";

import User from "./entity/User";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import { addressToJwtMap } from "./utils/addessToJwtMap";

@ObjectType()
class LoginResponse {
  @Field(() => String)
  accessToken!: string;

  @Field(() => User)
  user!: User;
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

  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext): Promise<User> | null {
    const authorization = context.req.headers["authorization"];

    try {
      const token = authorization?.split(" ")[1];
      if (!token) return null;
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET);
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");
    return true;
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
    if (!user.password) throw new Error("Please sign in with your walllet");

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error("Invalid password");

    // loginc successfull, add refresh token in cookie
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => LoginResponse)
  async web3LoginRegister(
    @Arg("address") address: string,
    @Arg("signature") signature: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    let user = await User.findOne({ where: { address } });

    if (!user)
      await User.insert({
        address,
      });

    user = await User.findOne({ where: { address } });

    if (!user) throw new Error("User not found, this should never happen");

    const message = addressToJwtMap.get(address);
    if (!message) throw new Error("No message found, invalid!");

    const payload: any = verify(message, process.env.SIGN_TOKEN_SECRET);
    if (payload.address !== address) throw new Error("Invalid token!");

    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress !== address) throw new Error("Invalid Signature");

    // loginc successfull, add refresh token in cookie
    sendRefreshToken(res, createRefreshToken(user));
    addressToJwtMap.delete(address);

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }
}
