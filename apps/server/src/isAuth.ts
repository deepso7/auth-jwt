import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { MyContext } from "./MyContext";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  try {
    const token = authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const payload = verify(token, process.env.ACCESS_TOKEN_SECET);
    context.payload = payload as any;
    return next();
  } catch (err) {
    console.log(err);
    throw new Error("Not authenticated");
  }
};
