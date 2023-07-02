// import { Redis } from "./Redis";
import * as jwt from "jsonwebtoken";
import { getEnvironmentVariables } from "../environments/environment";
import * as Crypto from "crypto";

export class Jwt {
  static jwtSign(payload, userId, expires_in: string = "1h") {
    // Jwt.gen_secret_key();
    return jwt.sign(payload, getEnvironmentVariables().jwt_secret_key, {
      expiresIn: expires_in,
      audience: userId.toString(),
      issuer: "technyks.com",
    });
  }

  static jwtVerify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getEnvironmentVariables().jwt_secret_key,
        (err, decoded) => {
          if (err) reject(err);
          else if (!decoded) reject(new Error("User is not authorised."));
          else resolve(decoded);
        }
      );
    });
  }

  static async jwtSignRefreshToken(
    payload,
    userId,
    expires_in: string = "1y"
    // redis_ex: number = 365 * 24 * 60 * 60
    // redis_ex: number = 20
  ) {
    try {
      const refreshToken = jwt.sign(
        payload,
        getEnvironmentVariables().jwt_refresh_secret_key,
        {
          expiresIn: expires_in,
          audience: userId.toString(),
          issuer: "technyks.com",
        }
      );

      // set refreshToken in Redis with key userId
      // await Redis.setValue(userId.toString(), refreshToken, redis_ex);
      return refreshToken;
    } catch (e) {
      // throw new Error(e);
      throw e;
    }
  }

  static jwtVerifyRefreshToken(refeshToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refeshToken,
        getEnvironmentVariables().jwt_refresh_secret_key,
        (err, decoded) => {
          if (err) reject(err);
          else if (!decoded) reject(new Error("User is not authorised."));
          else {
            // match refresh tokens from Redis database
            const user: any = decoded;
            // Redis.getValue(user.aud)
            //   .then((value) => {
            //     if (value === refeshToken) resolve(decoded);
            //     else
            //       reject(
            //         new Error("Your Session is Expired! Please Login Again...")
            //       );
            //   })
            //   .catch((e) => {
            //     reject(e);
            //   });
          }
        }
      );
    });
  }

  private static gen_secret_key() {
    const DEV_access_token_secret_key = Crypto.randomBytes(32).toString("hex");
    const DEV_refresh_token_secret_key = Crypto.randomBytes(32).toString("hex");

    const PROD_access_token_secret_key = Crypto.randomBytes(32).toString("hex");
    const PROD_refresh_token_secret_key =
      Crypto.randomBytes(32).toString("hex");

    console.table({
      DEV_access_token_secret_key,
      DEV_refresh_token_secret_key,
      PROD_access_token_secret_key,
      PROD_refresh_token_secret_key,
    });
  }
}
