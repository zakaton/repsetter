import { useEffect, useState, useRef } from "react";
import LazyVideo from "./LazyVideo";
import { useExerciseVideos } from "../context/exercise-videos-context";
import { isMobile } from "react-device-detect";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const keysToDelete = [];

export default function ExerciseTypeVideo(
  props = { exerciseTypeId: undefined }
) {
  const { exerciseTypeId } = props;
  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);

  const { getExerciseVideo, exerciseVideos } = useExerciseVideos();
  useEffect(() => {
    if (exerciseTypeId) {
      getExerciseVideo(exerciseTypeId);
    }
  }, [exerciseTypeId]);

  const [showVideo, setShowVideo] = useState(isMobile);

  const videoRef = useRef(null);
  useEffect(() => {
    const { current: video } = videoRef;
    if (video) {
      if (showVideo) {
        video.play();
      } else {
        video.pause();
      }
    }
  }, [showVideo]);
  return (
    <div
      onMouseEnter={(e) => setShowVideo(true)}
      onMouseLeave={(e) => setShowVideo(false)}
    >
      <LazyVideo
        onSuspend={(e) => {
          document.addEventListener("click", () => e.target.play(), {
            once: true,
          });
        }}
        src={exerciseVideos?.[exerciseTypeId].url}
        poster={exerciseVideos?.[exerciseTypeId].thumbnailUrl}
        autoPlay={true}
        muted={true}
        loop={true}
        className={classNames("aspect-[4/3]", showVideo ? "" : "hidden")}
        playsInline={true}
        controls={false}
        ref={videoRef}
      ></LazyVideo>
      <img
        src={exerciseVideos?.[exerciseTypeId].thumbnailUrl}
        className={classNames("aspect-[4/3]", showVideo ? "hidden" : "")}
      ></img>
    </div>
  );
}
