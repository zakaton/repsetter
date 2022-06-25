import { useState, createContext, useContext } from "react";
import { supabase } from "../utils/supabase";

export const ExerciseVideosContext = createContext();

export function ExerciseVideoContextProvider(props) {
  const [exerciseVideos, setExerciseVideos] = useState({});

  const getExerciseVideo = async (id) => {
    console.log("requesting video", id);
    if (!exerciseVideos[id]) {
      const { data: exerciseVideoBlob, error } = await supabase.storage
        .from("exercise")
        .download(`public/${id}.mp4`);
      if (error) {
        console.error(error);
      } else {
        setExerciseVideos({
          ...exerciseVideos,
          [id]: {
            blob: exerciseVideoBlob,
            url: URL.createObjectURL(exerciseVideoBlob),
          },
        });
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
