import { useState, createContext, useContext } from "react";
import { supabase, generateUrlSuffix } from "../utils/supabase";

export const PicturesContext = createContext();

export function PicturesContextProvider(props) {
  const [pictures, setPictures] = useState({});

  const getPicture = async (id, dates, refresh = false) => {
    console.log("requesting picture", id);

    if (!pictures[id] || refresh) {
      const { data: list, error: listError } = await supabase.storage
        .from("picture")
        .list(id);
      if (listError) {
        console.error(listError);
      }

      const imageDetails = list?.find(({ name }) => name.startsWith("image"));

      if (imageDetails) {
        const { publicURL: PictureUrl, error: getPictureError } =
          await supabase.storage
            .from("picture")
            .getPublicUrl(`${id}/image.jpg${generateUrlSuffix(imageDetails)}`);

        if (getPictureError) {
          console.error(getPictureError);
        } else {
          const newPictures = {
            ...pictures,
            [id]: {
              url: PictureUrl,
            },
          };
          console.log("newPictures", newPictures);
          setPictures(newPictures);
        }
      } else {
        const newPictures = {
          ...pictures,
          [id]: {},
        };
        console.log("newPictures", newPictures);
        setPictures(newPictures);
      }
    } else {
      console.log(" picture cache hit");
    }
  };

  const value = { pictures, getPicture };

  return <PicturesContext.Provider value={value} {...props} />;
}

export function usePictures() {
  const context = useContext(PicturesContext);
  return context;
}
