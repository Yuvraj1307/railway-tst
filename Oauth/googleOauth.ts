// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()
//sdvsdfdfgsdfgwdf
import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
} from "passport-google-oauth20";
import passport2 from "passport";
import { v4 as uuidv4 } from "uuid";
import express, { Router } from "express";
import Customermodel from "../model/CustomerModel";
import { Document } from "mongoose";
const Grouter: Router = express.Router();
import jwt from "jsonwebtoken";

// "151213675805-hkbtnbt6b9o4la3o7io9p1k3il4b2ruk.apps.googleusercontent.com",
// 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
passport2.use(
  new GoogleStrategy(
    {
      clientID:"750955027234-a6bv2r2bjf89nkmpqplc4pneluotueph.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "https://oauth-doctor.cyclic.app/customer/user/auth/google/callback",
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
  passport2.authenticate("google", { scope: ["profile", "email"] })
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
  passport2.authenticate("google", {
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
      `http://127.0.0.1:5501/Frontend/home.html?token=${token}&name=${user.name}&role=${user.Role}&id=${user._id}&status=${user.status}`
    );
  }
);

export default Grouter;
