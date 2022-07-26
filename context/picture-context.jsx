import { useState, createContext, useContext } from "react";
import { pictureTypes } from "../utils/picture-utils";
import { supabase, generateUrlSuffix, dateToString } from "../utils/supabase";

export const PicturesContext = createContext();

export function PicturesContextProvider(props) {
  const [pictures, setPictures] = useState({}); // {userId: {date: {type: url}}}

  const getPicture = async (userId, config, refresh = false) => {
    console.log("requesting picture", userId, config);

    let { date } = config;
    const dates = Array.isArray(date) ? date : [date];
    const dateStrings = dates.map((date) => dateToString(date));

    const { options, types = pictureTypes } = config;

    let picturesList = [];
    if (options) {
      const { data: list, error: listError } = await supabase.storage
        .from("picture")
        .list(userId, options);
      if (listError) {
        console.error(listError);
      } else {
        picturesList = list;
      }
    } else if (dateStrings?.length > 0) {
      await Promise.all(
        dateStrings.map(async (dateString) => {
          const { data: list, error: listError } = await supabase.storage
            .from("picture")
            .list(userId, { search: dateString });
          if (listError) {
            console.error(listError);
          } else {
            picturesList = picturesList.concat(...list);
          }
        })
      );
    }

    picturesList.forEach((picture) => {
      const [dateString, type] = picture.name.split(".")[0].split("_");
      picture.dateString = dateString;
      picture.type = type;
    });
    console.log("picturesList", picturesList, pictures);
    console.log(types);
    picturesList = picturesList
      .filter((picture) => types.includes(picture.type))
      .filter(
        (picture) =>
          refresh || !pictures[userId]?.[picture.dateString]?.[picture.type]
      );

    console.log("picturesList", picturesList);

    const newPictures = {
      ...pictures,
    };

    if (refresh) {
      if (dateStrings) {
        dateStrings.forEach((dateString) => {
          types.forEach((type) => {
            delete newPictures[userId]?.[dateString]?.[type];
          });
        });
      } else {
      }
    }

    if (picturesList.length > 0) {
      const picturePaths = picturesList.map(
        (picture) => `${userId}/${picture.name}`
      );
      const { data: pictureUrls, error } = await supabase.storage
        .from("picture")
        .createSignedUrls(picturePaths, 60);
      if (error) {
        console.error(error);
      } else {
        console.log("pictureUrls", pictureUrls);

        pictureUrls.forEach(({ path, signedURL }) => {
          const [id, name] = path.split("/");
          const [dateString, type] = name.split(".")[0].split("_");
          newPictures[id] = newPictures[id] || {};
          newPictures[id][dateString] = newPictures[id][dateString] || {};
          newPictures[id][dateString][type] = signedURL;

          const picture = picturesList.find((picture) => picture.name == name);
          if (picture) {
            newPictures[id][dateString][type] +=
              "&" + generateUrlSuffix(picture);
          }
        });
        console.log("newPictures", newPictures);
        setPictures(newPictures);
      }
    } else {
      newPictures[userId] = newPictures[userId] || {};
      dateStrings.forEach((dateString) => {
        newPictures[userId][dateString] = newPictures[userId][dateString] || {};
      });
      console.log("newPictures", newPictures);
      setPictures(newPictures);
    }
  };

  const value = { pictures, getPicture };

  return <PicturesContext.Provider value={value} {...props} />;
}

export function usePictures() {
  const context = useContext(PicturesContext);
  return context;
}
