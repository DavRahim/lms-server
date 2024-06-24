import * as express from "express";
import { IUser } from "../src/models/user.model";


declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
