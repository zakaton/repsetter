import { useState, createContext, useContext } from "react";
import { supabase, generateUrlSuffix } from "../utils/supabase";

export const ExerciseVideosContext = createContext();

export function ExerciseVideoContextProvider(props) {
  const [exerciseVideos, setExerciseVideos] = useState({});

  const getExerciseVideo = async (idOrIds, refresh = false) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    console.log("requesting video and poster", ids);

    if (ids.some((id) => !exerciseVideos[id]) || refresh) {
      const idsToFetch = refresh
        ? ids
        : ids.filter((id) => !exerciseVideos[id]);

      const newExerciseVideos = {
        ...exerciseVideos,
      };

      await Promise.all(
        idsToFetch.map(async (id) => {
          const { data: list, error: listError } = await supabase.storage
            .from("exercise")
            .list(id);
          if (listError) {
            console.error(listError);
          }

          const videoDetails = list?.find(({ name }) =>
            name.startsWith("video")
          );
          const imageDetails = list?.find(({ name }) =>
            name.startsWith("image")
          );

          const { publicURL: url, error: getVideoUrlError } =
            await supabase.storage
              .from("exercise")
              .getPublicUrl(
                `${id}/video.mp4?${generateUrlSuffix(videoDetails)}`
              );

          const { publicURL: thumbnailUrl, error: getVideoPosterError } =
            await supabase.storage
              .from("exercise")
              .getPublicUrl(
                `${id}/image.jpg?${generateUrlSuffix(imageDetails)}`
              );

          if (getVideoUrlError || getVideoPosterError) {
            console.error(getVideoUrlError || getVideoPosterError);
          } else {
            newExerciseVideos[id] = {
              url,
              thumbnailUrl,
            };
          }
        })
      );

      console.log("newExerciseVideos", newExerciseVideos);
      setExerciseVideos(newExerciseVideos);
    } else {
      console.log("exercise video cache hit");
    }
  };

  const value = { exerciseVideos, getExerciseVideo };

  return <ExerciseVideosContext.Provider value={value} {...props} />;
}

export function useExerciseVideos() {
  const context = useContext(ExerciseVideosContext);
  return context;
}
