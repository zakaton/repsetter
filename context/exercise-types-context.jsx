import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "../utils/supabase";

export const ExerciseTypesContext = createContext();

export function ExerciseTypesContextProvider(props) {
  const [exerciseTypes, setExerciseTypes] = useState();
  const [isGettingExerciseTypes, setIsGettingExerciseTypes] = useState(false);
  const getExerciseTypes = async (refresh) => {
    if (!exerciseTypes || refresh) {
      setIsGettingExerciseTypes(true);
      const { data: exerciseTypes } = await supabase
        .from("exercise_type")
        .select("*")
        .order("name", { ascending: true });
      console.log("fetched exerciseTypes", exerciseTypes);
      setExerciseTypes(exerciseTypes);
      setIsGettingExerciseTypes(false);
    }
  };

  /*
  useEffect(() => {
    if (exerciseTypes) {
      console.log(`subscribing to exercise_type updates`);
      const subscription = supabase
        .from(`exercise_type`)
        .on("INSERT", (payload) => {
          console.log(`new exercise`, payload);
          getExerciseTypes(true);
        })
        .on("UPDATE", (payload) => {
          console.log(`updated exercise`, payload);
          getExerciseTypes(true);
        })
        .on("DELETE", (payload) => {
          console.log(`deleted exercise`, payload);
          const deletedExerciseType = payload.old;
          // eslint-disable-next-line no-shadow
          setExerciseTypes(
            exerciseTypes.filter(
              (exerciseType) => exerciseType?.id !== deletedExerciseType.id
            )
          );
        })
        .subscribe();
      return () => {
        console.log(`unsubscribing to exercise_type updates`);
        supabase.removeSubscription(subscription);
      };
    }
  }, [exerciseTypes]);
  */

  const value = {
    getExerciseTypes,
    isGettingExerciseTypes,
    exerciseTypes,
  };

  return <ExerciseTypesContext.Provider value={value} {...props} />;
}

export function useExerciseTypes() {
  const context = useContext(ExerciseTypesContext);
  return context;
}
