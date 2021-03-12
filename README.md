# heroku-netflix (repository for deploying to Heroku)

-   Deployed at: https://netflix-project.herokuapp.com/
-   Project repository / development repository: https://github.com/mattfrancis888/netflix

## Approach to deployment:

I’m going to serve my React app with an Express server. By using this approach, the client and the API are on the same domain. This allows cookies to be sent from the API and be used by our client.

## Video on “How to serve a React app from an Express Server”:

https://www.youtube.com/watch?v=QBXWZPy1Zfs&ab_channel=FullstackDevelopment

## How I deployed to Heroku:

1. Create **build** folder from React with `npm run build` so that Express could serve up the client.
2. Ensure that the build folder is inside `backend-build` and is served up in Express.js (make sure that the TS files are converted to JS with `npm run convert`).
3. Heroku cannot read Typescript code right away, follow:
   https://stackoverflow.com/questions/59587296/how-to-deploy-a-typescript-nodejs-and-express-app-to-heroku; [Make sure that `Heroku's postinstall` is configured](https://stackoverflow.com/questions/48972663/how-do-i-compile-typescript-at-heroku-postinstall)

4. Ensure that the environment variables are set, in this project, if the **privateKey** environment variable is missing, the server would fail to start up.

## Notes:

-   Cookie config is different in our development repository. Here, we have "Secure" and "SameSite=Strict" (needs "Secure" to be enabled) configuraitons to our cookies. This is because when in development, localhost is an http and cannot have "Secure".

-   Access token expiry in `controllers/authentication.ts` is different from development folder(`netflix` repository). It’s 30d here because our limit on server/database calls is limited; we can’t always ask for a new access token every x minutes.
