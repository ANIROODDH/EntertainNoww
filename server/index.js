require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;

const app = express();

// * Middleware for express server
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(require("cookie-parser")());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// * Start the Apollo server connection with middleware
const startApolloServer = async (typeDefs, resolvers, context) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });

  await server.start();

  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

startApolloServer(typeDefs, resolvers, authMiddleware);