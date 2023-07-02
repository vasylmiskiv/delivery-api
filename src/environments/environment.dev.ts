import { Environment } from "./environment";
import { Utils } from "../utils/Utils";

Utils.dotenvConfigs();

export const DevEnvironment: Environment = {
  db_uri: process.env.MONGO_DB_URI,
  jwt_secret_key: "abc123",
  jwt_refresh_secret_key: "abc123",
  sendgrid: {
    api_key: "sendgridapikey",
    email_from: "sendgridapikey",
  },
  // gmail_auth: {
  //     user: process.env.DEV_GMAIL_USER,
  //     pass: process.env.DEV_GMAIL_PASS
  // },
  // redis: {
  //   username: null,
  //   password: null,
  //   host: "123",
  //   port: 123,
  // },
  stripe: {
    publishable_key: "somekey",
    secret_key: "secret123",
  },
};
