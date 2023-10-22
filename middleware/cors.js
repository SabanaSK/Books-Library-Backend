import * as dotenv from "dotenv";

dotenv.config();

const corsOptions = {
  origin: `http://localhost:${process.env.PORT}`,
};

export default corsOptions;
