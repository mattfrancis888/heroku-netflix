"use strict";
//Protected routes
//jwtlog in is a way to check if user is signed in at x route. This is related to our requireAuth Hoc.
//passport.use(jwtLogin);
//authenticates if a user can log in / acess a specific resource
//We are not using cookie sessions, so we put in session: false
//const requireAuth = passport.authenticate("jwt", { session: false });
//requireAuth uses the jwtLogin strategy
//We want to ensure that the user token can acess specific resources in the page
//To do so, we created the requireAuth middleware
//THis is also known as a "protected route"
//Example of using a strategy /Dummy Route:
// router.get("/", requireAuth, (req, res) => {
//     // If JWT token can be understood (only registered users have JWT tokens that are valid/can be read),
//     //  show this page
//     //     Note: To validate token, you could use authenticateToken(used in authentication.ts)
//     //      or requireAuth (passport strategy), both are valid approaches
//     //     authenticateToken approach is based on:
//     //     https://github.com/WebDevSimplified/JWT-Authentication/blob/master/authServer.js
//     //     https://github.com/hnasr/javascript_playground/blob/master/jwt-course/jwt-final/jwtAuth.mjs
//     //     requireAuth approach is based on:
//     //     https://solidgeargroup.com/en/refresh-token-with-jwt-authentication-node-js/
//     res.send("hi");
// });
