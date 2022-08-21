import { useState, createContext, useContext } from "react";
import { supabase, generateUrlSuffix } from "../utils/supabase";

export const CoachPicturesContext = createContext();

export function CoachPicturesContextProvider(props) {
  const [coachPictures, setCoachPictures] = useState({});

  const getCoachPicture = async (ids, refresh = false) => {
    console.log("requesting coach picture", ids);

    ids = Array.isArray(ids) ? ids : [ids];

    const newCoachPictures = { ...coachPictures };
    let updateCoachPictures = false;

    await Promise.all(
      ids.map(async (id) => {
        if (!coachPictures[id] || refresh) {
          const { data: list, error: listError } = await supabase.storage
            .from("coach-picture")
            .list(id);
          if (listError) {
            console.error(listError);
          }

          console.log("coachesList", list);

          const imageDetails = list?.find(({ name }) =>
            name.startsWith("image")
          );

          if (imageDetails) {
            const { publicURL: coachPictureUrl, error: getCoachPictureError } =
              await supabase.storage
                .from("coach-picture")
                .getPublicUrl(
                  `${id}/image.jpg?${generateUrlSuffix(imageDetails)}`
                );

            if (getCoachPictureError) {
              console.error(getCoachPictureError);
            } else {
              newCoachPictures[id] = {
                url: coachPictureUrl,
              };
              updateCoachPictures = true;
            }
          } else {
            console.log("existing", coachPictures);
            newCoachPictures[id] = {};
            updateCoachPictures = true;
            console.log("newCoachPictures", newCoachPictures);
          }
        } else {
          console.log("coach picture cache hit");
        }
      })
    );

    if (updateCoachPictures) {
      setCoachPictures(newCoachPictures);
    }
  };

  const value = { coachPictures, getCoachPicture };

  return <CoachPicturesContext.Provider value={value} {...props} />;
}

export function useCoachPictures() {
  const context = useContext(CoachPicturesContext);
  return context;
}
