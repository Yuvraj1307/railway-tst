// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()
import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
} from "passport-google-oauth20";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import express, { Router } from "express";
import Customermodel from "../model/CustomerModel";
import { Document } from "mongoose";
const Grouter: Router = express.Router();
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "221992717439-u77bv2tpqo6uhdbatucjbcasjnsi1828.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:4500/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      interface User {
        name: string;
        email: string;
        password: string;
        Role: string;
        Pets?: string[];
        status: boolean;
      }
      if (profile._json.email_verified) {
        let user: User | null;
        let name = profile._json.name;
        let email = profile._json.email;

        user = await Customermodel.findOne({ email });

        if (user) {
          return cb(null, user);
        }

        const newUser = new Customermodel({
          name: name,
          email: email,
          password: uuidv4(),
          Role: "customer",
          Pets: [],
          status: true,
        });

        await newUser.save();
        return cb(null, newUser);
      }
    }
  )
);
Grouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  Role: string;
  Pets?: string[];
  status: boolean;
}

Grouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google/login",
    session: false,
  }),
  function (req, res) {
    let user = req.user as IUser;

    var token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        status: user.status,
        name: user.name,
        role: user.Role,
      },
      "masai"
    );
    //
    //  https://transcendent-horse-5d8cb8.netlify.app/masseges.html?id=${user._id}
    res.redirect(
      `https://yuvraj1307.github.io/token=${token}&name=${user.name}&role=${user.Role}`
    );
  }
);

export default Grouter;
