import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import User from "./entity/User";
import { UserResolver } from "./UserResolvers";

(async () => {
  try {
    const app = express();

    app.get("/", (_req, res) => {
      res.send("Bruhhh");
    });

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver],
      }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

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
