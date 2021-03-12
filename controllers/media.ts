import { Request, Response, NextFunction, response } from "express";
import pool from "../databasePool";
import { FORBIDDEN_STATUS, INTERNAL_SERVER_ERROR_STATUS } from "../constants";
import _ from "lodash";
import jwt_decode from "jwt-decode";
interface genreAndCast {
    casts?: any;
    genres?: any;
}

export const getMedias = async (req: Request, res: Response) => {
    try {
        const response = await pool.query(
            `Select media_id, media_title,
            media_date,media_description,banner_title_image
            , banner_image,name_tokens, media_type_name from media NATURAL JOIN lookup_media_type NATURAL JOIN media_type`
        );
        res.send({ medias: response.rows });
        // res.send({...response.rows})
    } catch (error) {
        pool.query("ROLLBACK");
        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};

export const getMediaGenreAndCast = async (req: Request, res: Response) => {
    try {
        let mediaId = req.params.mediaId;

        //Transaction
        await pool.query("BEGIN");

        //Get Genre
        const genreResponse = await pool.query(
            `SELECT genre_name FROM lookup_media_genre
            NATURAL JOIN genre WHERE media_id = $1;`,
            [mediaId]
        );
        //Get Cast / Actors
        const castResponse = await pool.query(
            `SELECT actor_first_name, actor_last_name FROM lookup_media_actor
            NATURAL JOIN actor WHERE media_id = $1;`,
            [mediaId]
        );
        pool.query("COMMIT");
        let results: genreAndCast = {};
        results.casts = castResponse.rows;
        results.genres = genreResponse.rows;
        res.send(results);
        // res.send({...response.rows})
    } catch (error) {
        pool.query("ROLLBACK");
        console.log("ROLLBACK TRIGGERED");

        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};

export const getMediaWatchingByUser = async (req: any, res: Response) => {
    const decodedJwt = jwt_decode(req.cookies.ACCESS_TOKEN);
    //@ts-ignore
    const email = decodedJwt.subject;

    try {
        const response = await pool.query(
            `SELECT media_id, media_title,
            media_date,media_description,banner_title_image
            ,banner_image,name_tokens FROM lookup_media_watching
            NATURAL JOIN  media WHERE email = $1`,
            [email]
        );
        // if (!response.rows[0]) {
        //     throw new Error("User does not own this listing");
        // }

        res.send({ watching: response.rows });
    } catch (error) {
        console.log(error);
        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};

export const addToWatchingByUser = async (req: any, res: Response) => {
    const decodedJwt = jwt_decode(req.cookies.ACCESS_TOKEN);
    //@ts-ignore
    const email = decodedJwt.subject;
    const mediaId = req.params.mediaId;
    try {
        //Transaction
        await pool.query("BEGIN");
        //Insert if it does not exist on table
        await pool.query(
            `INSERT INTO lookup_media_watching(email, media_id)
                SELECT $1, $2
                WHERE
                    NOT EXISTS (
                    SELECT email FROM lookup_media_watching 
                    WHERE email = $3 AND media_id = $4
                );`,
            [email, mediaId, email, mediaId]
        );
        const response = await pool.query(
            `SELECT media_id, media_title,
            media_date,media_description,banner_title_image
            ,banner_image,name_tokens, added_date FROM lookup_media_watching
            NATURAL JOIN media WHERE email = $1 ORDER BY added_date`,
            [email]
        );
        // if (!response.rows[0]) {
        //     throw new Error("User does not own this listing");
        // }
        pool.query("COMMIT");
        res.send({ watching: response.rows });
    } catch (error) {
        pool.query("ROLLBACK");
        console.log("ROLLBACK TRIGGERED", error);
        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};

export const removeFromWatchingByUser = async (req: any, res: Response) => {
    const decodedJwt = jwt_decode(req.cookies.ACCESS_TOKEN);
    //@ts-ignore
    const email = decodedJwt.subject;
    const mediaId = req.params.mediaId;
    try {
        //Transaction
        await pool.query("BEGIN");
        //Insert if it does not exist on table
        await pool.query(
            `DELETE FROM lookup_media_watching
            WHERE email = $1 AND media_id = $2;`,
            [email, mediaId]
        );
        const response = await pool.query(
            `SELECT media_id, media_title,
            media_date, media_description, banner_title_image
            , banner_image, name_tokens FROM lookup_media_watching
            NATURAL JOIN media WHERE email = $1`,
            [email]
        );
        // if (!response.rows[0]) {
        //     throw new Error("User does not own this listing");
        // }
        pool.query("COMMIT");
        res.send({ watching: response.rows });
    } catch (error) {
        pool.query("ROLLBACK");
        console.log("ROLLBACK TRIGGERED", error);
        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};

export const getMediasBySearch = async (req: Request, res: Response) => {
    const searchKeyword = req.query.q;
    try {
        const response = await pool.query(
            `SELECT media_id, media_title,
            media_date,media_description,banner_title_image
            , banner_image,name_tokens,  media_type_name from media NATURAL JOIN lookup_media_type NATURAL JOIN media_type
            WHERE name_tokens @@ to_tsquery($1);`,
            [searchKeyword]
        );
        res.send({ medias: response.rows });
        // res.send({...response.rows})
    } catch (error) {
        pool.query("ROLLBACK");
        return res.sendStatus(INTERNAL_SERVER_ERROR_STATUS);
    }
};
