import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/router";

export const SelectedExerciseTypeContext = createContext();

export function SelectedExerciseTypeContextProvider(props) {
  const router = useRouter();

  const [selectedExerciseType, setSelectedExerciseType] = useState();
  const [selectedExerciseTypeName, setSelectedExerciseTypeName] = useState();
  const [checkedQuery, setCheckedQuery] = useState(false);

  useEffect(() => {
    if (!router.isReady || checkedQuery) {
      return;
    }
    if ("exercise-type" in router.query) {
      const selectedExerciseTypeName = router.query["exercise-type"];
      setSelectedExerciseTypeName(selectedExerciseTypeName);
    }
    setCheckedQuery(true);
  }, [router.isReady, checkedQuery]);

  useEffect(() => {
    if (router.isReady && checkedQuery && selectedExerciseType) {
      const query = {};
      query["exercise-type"] = selectedExerciseType.name;
      router.replace({ query: { ...router.query, ...query } }, undefined, {
        shallow: true,
      });
    }
  }, [router.pathname]);

  const [isGettingExerciseType, setIsGettingExerciseType] = useState(false);
  const getExerciseType = async () => {
    if (isGettingExerciseType) {
      return;
    }

    setIsGettingExerciseType(true);
    const { data: exerciseType, error } = await supabase
      .from("exercise_type")
      .select("*")
      .eq("name", selectedExerciseTypeName)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      setSelectedExerciseType(exerciseType);
    }
    setIsGettingExerciseType(false);
  };
  useEffect(() => {
    if (selectedExerciseTypeName && !selectedExerciseType) {
      getExerciseType();
    }
  }, [selectedExerciseTypeName]);

  useEffect(() => {
    if (!router.isReady || !checkedQuery) {
      return;
    }

    const query = {};
    if (selectedExerciseType) {
      query["exercise-type"] = selectedExerciseType.name;
    } else {
      delete router.query["exercise-type"];
    }

    router.replace({ query: { ...router.query, ...query } }, undefined, {
      shallow: true,
    });
  }, [selectedExerciseType]);

  const value = {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  };
  return <SelectedExerciseTypeContext.Provider value={value} {...props} />;
}

export function useSelectedExerciseType() {
  const context = useContext(SelectedExerciseTypeContext);
  return context;
}
