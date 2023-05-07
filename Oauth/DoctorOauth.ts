// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()
import {
    Strategy as GoogleStrategy,
    StrategyOptionsWithRequest,
  } from "passport-google-oauth20";
  import passport from "passport";
  import { v4 as uuidv4 } from "uuid";
  import express, { Router } from "express";
  import { Document } from "mongoose";
  const DoctorRouter: Router = express.Router();
  import jwt from "jsonwebtoken";
import DoctorModel from "../model/DoctorModel";
 
  
  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "221992717439-u77bv2tpqo6uhdbatucjbcasjnsi1828.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:4500/doctor/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, cb) {
        interface User {
          name: string;
          email: string;
          password: string;
          Role: string;
          UPRN: string;
          speciality: string[];
          status: boolean;
        }
        if (profile._json.email_verified) {
          let user: User | null;
          let name = profile._json.name;
          let email = profile._json.email;
  
          user = await DoctorModel.findOne({ email });
  
          if (user) {
            return cb(null, user);
          }
  
          const newUser = new DoctorModel({
            name: name,
            email: email,
            password: uuidv4(),
            Role: "doctor",
            status: true,
          });
  
          await newUser.save();
          return cb(null, newUser);
        }
      }
    )
  );
  DoctorRouter.get(
    "/auth/google",(req,res,next)=>{
        const UPRN = req.query.UPRN;
  const state = JSON.stringify({ UPRN });
    passport.authenticate("google", { scope: ["profile", "email"],  state })(req, res, next);
    }
  );
  
  interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    Role: string;
    UPRN: string;
    speciality: string[];
    status: boolean;
  }
  
  DoctorRouter.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/google/login",
      session: false,
    }),
   async function (req, res) {
      let user = req.user as IUser;
      const UPRN:any = JSON.parse(req.query.state as string).UPRN;
      let data= await DoctorModel.findByIdAndUpdate({_id:user["_id"]},{UPRN:UPRN})
      // console.log(data)
      // console.log(UPRN)
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
      
      //  https://transcendent-horse-5d8cb8.netlify.app/masseges.html?id=${user._id}
      res.redirect(
        `https://yuvraj1307.github.io?token=${token}&name=${user.name}&role=${user.Role}`
      );
    }
  );
  
  export default DoctorRouter;
  