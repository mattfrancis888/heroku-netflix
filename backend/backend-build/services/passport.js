"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtLogin = exports.localLogin = void 0;
var passport_jwt_1 = require("passport-jwt");
var passport_local_1 = require("passport-local");
var dotenv_1 = __importDefault(require("dotenv"));
var databasePool_1 = __importDefault(require("../databasePool"));
var bcrypt_1 = __importDefault(require("bcrypt"));
//IMPORTANT: https://www.youtube.com/watch?v=7Q17ubqLfaM&t=772s&ab_channel=WebDevSimplified
//Video above will make everything clearer
//We use passport to figure out if a user is authenticated in our application
//passport strategy is a method for authenticating a user. There are many different strategies such as facebook login, github login,etc
if (process.env.NODE_ENV !== "production") {
    //We don't need dotenv when in production
    dotenv_1.default.config();
}
var comparePassword = function (candidatePassword, passwordInDatabase, callback) {
    bcrypt_1.default.compare(candidatePassword, passwordInDatabase, function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    });
};
//Created a strategy to log in, If the user log ins sucesfully, will give the user a token so they can access "protected routes"/
//resources that can only be accessed by logged in users
//Create local strategy
var localOptions = {
    //By defaut localStrategy thinks the usernameField is username; in our case we are logging in with email and password
    usernameField: "email",
};
exports.localLogin = new passport_local_1.Strategy(localOptions, function (email, password, done) {
    //Used email:any because LocalStrategy automaticaly thinks email is a string, but since our User schema follows
    //IUser's types; email needs to be object type when we do User.findOne({email:email)})
    //Check if email is valid
    databasePool_1.default.query("SELECT email, password FROM AUTH WHERE email =  '" + email + "'", function (err, user) {
        //done() is just a non-official standard name for a function (a.k.a callback)
        //that informs the calling function (parent in stacktrace) that a task is completed.
        if (err)
            return done(err, false); //Will return "Unauthorized" in the response
        //Second param in done(), it asks if there is a user is returned
        if (!user.rows[0]) {
            return done(null, false); //Will return "Unauthorized" in the response
        }
        //Compare password - is password equal to user.password?
        //we are comparing our hashed password (stored in our database that was created by salt + submitted password) with
        //salting the current submitted password and see if the hash password matches
        comparePassword(password, user.rows[0].password, function (err, isMatch) {
            if (err)
                return done(err);
            if (!isMatch)
                return done(null, false); //Will return "Unauthorized" in the response
            return done(null, user.rows[0]); //user can be accesed as req.user now; as demosntrated in authentication.ts
        });
    });
});
//Create strategy that authenticates if a user can log in / acess a specific resource; also known as a "protected route"
var jwtOptions = {
    // jwtFromRequest tells the Strategy where to find the token / "payload".
    // We want to find it in "Headers" that's named "authorization"
    // "authorization" contains a JWT token that we generated with subject(the user id) and  and the private key in authentication.ts
    // We can "read" the token / the "payload", which contains the subject and the iat created in authenticaiton.ts.
    // This is demonstrated in jwtLogin
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromHeader("authorization"),
    //We also want to tell our Strategy what the "secret key" that was used to generate the token in authentication.ts
    secretOrKey: process.env.privateKey,
};
//jwtlog is used to check if a user's access token is valid at x route.
//This is related to requireAuth hoc and axios interceptors. Since mock tests requests nocks make fails if we send request headers of Authorizaiton
//we will not be using this because I will not be able to test at all.
//The downside of this is that our token will not be validated and a new access token would be given each time a user visits a rotue in the client
exports.jwtLogin = new passport_jwt_1.Strategy(jwtOptions, function (payload, done) {
    //Refer to comment in jwtOptions. The payload is a token and it's read by JWT. After it's read,
    // it recognizes that the token has a subject and iat properties that's defined in authentication.ts
    //Check if token expired
    if (Date.now() >= payload.exp * 1000) {
        done(null, false);
    }
    //Check if email in the payload is in our database
    //Reminder that 'subject' of JWT paylod is email
    console.log(payload);
    databasePool_1.default.query("SELECT email FROM AUTH WHERE email =  '" + payload.subject + "'", function (err, user) {
        //done() is just a non-official standard name for a function (a.k.a callback)
        //that informs the calling function (parent in stacktrace) that a task is completed.
        if (err)
            return done(err, false); //Will return "Unauthorized" in the response
        //Second param in done(), it asks if there is a user is returned
        if (user.rows[0]) {
            done(null, user.rows[0]); //user can be accesed as req.user now; as demosntrated in authentication.ts
        }
        else {
            done(null, false); //Will return "Unauthorized" in the response
        }
    });
});
