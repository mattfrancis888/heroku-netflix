import { Router, Request, Response } from "express";
import {
    signUp,
    signIn,
    signOut,
    refreshToken,
} from "../controllers/authentication";
import { localLogin } from "../services/passport";
import passport from "passport";
import jwt from "jsonwebtoken";

const requireSignIn = passport.authenticate("local", { session: false });
//requireSignin uses the locallogin strategy
passport.use(localLogin);

const router = Router();

//Go through passsport strategy middleware first, if succesfull, will be continuted to signIn middleware
router.post("/signin", requireSignIn, signIn);
router.post("/signup", signUp);
router.post("/token", refreshToken);
router.post("/signout", signOut);

export default router;
