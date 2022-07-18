import { useState, createContext, useContext } from "react";
import { supabase } from "../utils/supabase";

export const ExerciseVideosContext = createContext();

export function ExerciseVideoContextProvider(props) {
  const [exerciseVideos, setExerciseVideos] = useState({});

  const getExerciseVideo = async (id) => {
    console.log("requesting video and poster", id);
    if (!exerciseVideos[id]) {
      const { publicURL: url, error: getVideoUrlError } = await supabase.storage
        .from("exercise")
        .getPublicUrl(`${id}.mp4`);

      const { publicURL: thumbnailUrl, error: getVideoPosterError } =
        await supabase.storage.from("exercise").getPublicUrl(`${id}.jpg`);

      if (getVideoUrlError || getVideoPosterError) {
        console.error(getVideoUrlError || getVideoPosterError);
      } else {
        const newExerciseVideos = {
          ...exerciseVideos,
          [id]: {
            url,
            thumbnailUrl,
          },
        };
        console.log("newExerciseVideos", newExerciseVideos);
        setExerciseVideos(newExerciseVideos);
      }
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
