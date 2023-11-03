import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import booksRouter from "./routes/booksRouter.js";
import usersRouter from "./routes/usersRouter.js";
import tokensRouter from "./routes/tokensRouter.js";
import inviteTokensRouter from "./routes/inviteTokensRouter.js";
import router from "./routes/resetTokensRouter.js";
import logger from "./utils/logger.js";
import cookieParser from "cookie-parser";
import corsOptions from "./middleware/cors.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use("/api/books", booksRouter);
app.use("/api/users", usersRouter);
app.use("/api/tokens", tokensRouter);

//Delete later
app.use("/api/inviteTokens", inviteTokensRouter);
app.use("/api/resetTokens", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
