import { Router, Request, Response } from "express";
import {
    getMedias,
    getMediaGenreAndCast,
    getMediaWatchingByUser,
    addToWatchingByUser,
    removeFromWatchingByUser,
    getMediasBySearch,
} from "../controllers/media";
const mediasRouter = Router();

mediasRouter.get("/medias", getMedias);
mediasRouter.get("/genre-cast/:mediaId", getMediaGenreAndCast);
mediasRouter.get("/watching", getMediaWatchingByUser);
mediasRouter.post("/add-to-watching/:mediaId", addToWatchingByUser);
mediasRouter.delete("/remove-from-watching/:mediaId", removeFromWatchingByUser);
mediasRouter.get("/search", getMediasBySearch);
export default mediasRouter;
