import * as dotenv from "dotenv";

dotenv.config();

const corsOptions = {
  origin: `http://localhost:${process.env.PORT}`,
  exposedHeaders: ["Authorization"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Auth-Token"],
};

export default corsOptions;
