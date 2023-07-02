import { Jwt } from "./../utils/Jwt";
import { validationResult } from "express-validator";

export class GlobalMiddleWare {
  static checkError(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new Error(errors.array()[0].msg));
    } else {
      next();
    }
  }

  static async auth(req, res, next) {
    const header_auth = req.headers.authorization; //Bearer token
    const token = header_auth ? header_auth.slice(7, header_auth.length) : null;
    // const authHeader = header_auth.split(' '); const token1 = authHeader[1];
    try {
      if (!token) {
        req.errorStatus = 401;
        next(new Error("User doesn't exist"));
      }
      const decoded = await Jwt.jwtVerify(token);
      req.user = decoded;
      next();
    } catch (e) {
      req.errorStatus = 401;
      // next(e);
      next(new Error("User doesn't exist"));
    }
  }

  static async decodeRefreshToken(req, res, next) {
    const refreshToken = req.body.refreshToken;
    try {
      if (!refreshToken) {
        req.errorStatus = 403;
        next(new Error("Access is forbidden! User doesn't exist"));
      }
      const decoded = await Jwt.jwtVerifyRefreshToken(refreshToken);
      req.user = decoded;
      next();
    } catch (e) {
      req.errorStatus = 403;
      // next(e);
      next(
        new Error(
          "Your Session is Expired or you are an Invalid User! Please Login Again..."
        )
      );
    }
  }

  static adminRole(req, res, next) {
    const user = req.user;
    if (user.type !== "admin") {
      // req.errorStatus = 401;
      next(new Error("You are an Unauthorised User"));
    }
    next();
  }
}
