import cache from "flat-cache"
import glob from "glob";
import fs from "fs";
import User from "../models/user";
import Photo from "../models/photo";

export const dailyVariableCleanup = async () => {
    await User.updateMany({}, {$unset: {todaysSavings: ""}});
};

export const cleanBlacklistCache = () => {
    const flatfile = cache.load("jwt_blacklist");
    const blacklistedTokens = flatfile.all();

    const currentTimeStamp = Math.floor(Date.now() / 1000);

    Object.entries(blacklistedTokens).forEach(([token, expirationTimeStamp]) => {
        if(expirationTimeStamp < currentTimeStamp)
            flatfile.removeKey(token);
    });

    flatfile.save();
};

export const annihilatePhotoOfIds = async ({photoId, userId}) => {
    await Photo.findOneAndRemove({_id: photoId, userId});

    removePhotoOfId(photoId);
};

const removePhotoOfId = photoId => {

    try {
        glob(`public/areaPhotos/${photoId}.*`, (err, files) => {
            if(err)
                return;

            fs.unlink(files[0], err => {
                if(err)
                    console.log(err);
            })
        })
    }
    catch(e) {
        console.log(e);
    }

};
