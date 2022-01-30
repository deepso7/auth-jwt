import "dotenv/config";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import cors from "cors";

import User from "./entity/User";
import { UserResolver } from "./UserResolvers";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

(async () => {
  try {
    const app = express();

    const whitelist = [
      "http://localhost:3000",
      "https://studio.apollographql.com",
    ];
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );

    app.use(cookieParser());

    app.get("/", (_req, res) => {
      res.send("Bruhhh");
    });

    app.get("/refresh_token", async (req, res) => {
      const token = req.cookies.jid;
      if (!token) return res.json({ ok: false, accessToken: "" });

      let payload: any = null;
      try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        console.log(err);
        return res.json({ ok: false, accessToken: "" });
      }

      try {
        const user = await User.findOne({ id: payload.userId });
        if (!user) return res.json({ ok: false, accessToken: "" });
        if (user.tokenVersion !== payload.tokenVersion)
          return res.json({ ok: false, accessToken: "" });
        // Update the refresh token
        sendRefreshToken(res, createRefreshToken(user));
        return res.json({ ok: true, accessToken: createAccessToken(user) });
      } catch (err) {
        console.log(err);
        return res.status(500).json("Internal Server Error");
      }
    });

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver],
      }),
      context: ({ req, res }) => ({ req, res }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    await createConnection({
      type: "mysql",
      database: "test-db",
      url: process.env.DATABASE_URL,
      logging: true,
      synchronize: true,
      // migrations: [path.join(__dirname, "./migrations/*")],
      entities: [User],
    });

    app.listen(4000, () => {
      console.log("Server started on port 4000");
    });
  } catch (err) {
    console.log(err);
  }
})();
