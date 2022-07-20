import { useState, createContext, useContext } from "react";
import { supabase, generateUrlSuffix } from "../utils/supabase";

export const CoachPicturesContext = createContext();

export function CoachPicturesContextProvider(props) {
  const [coachPictures, setCoachPictures] = useState({});

  const getCoachPicture = async (id, refresh = false) => {
    console.log("requesting coach picture", id);

    if (!coachPictures[id] || refresh) {
      const { data: list, error: listError } = await supabase.storage
        .from("coach-picture")
        .list(id);
      if (listError) {
        console.error(listError);
      }

      const imageDetails = list?.find(({ name }) => name.startsWith("image"));

      if (imageDetails) {
        const { publicURL: coachPictureUrl, error: getCoachPictureError } =
          await supabase.storage
            .from("coach-picture")
            .getPublicUrl(`${id}/image.jpg${generateUrlSuffix(imageDetails)}`);

        if (getCoachPictureError) {
          console.error(getCoachPictureError);
        } else {
          const newCoachPictures = {
            ...coachPictures,
            [id]: {
              url: coachPictureUrl,
            },
          };
          console.log("newCoachPictures", newCoachPictures);
          setCoachPictures(newCoachPictures);
        }
      } else {
        const newCoachPictures = {
          ...coachPictures,
          [id]: {},
        };
        console.log("newCoachPictures", newCoachPictures);
        setCoachPictures(newCoachPictures);
      }
    } else {
      console.log("coach picture cache hit");
    }
  };

  const value = { coachPictures, getCoachPicture };

  return <CoachPicturesContext.Provider value={value} {...props} />;
}

export function useCoachPictures() {
  const context = useContext(CoachPicturesContext);
  return context;
}
