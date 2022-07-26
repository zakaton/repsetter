import { useEffect, useState, useRef } from "react";
import LazyVideo from "./LazyVideo";
import { useExerciseVideos } from "../context/exercise-videos-context";
import { isMobile, isDesktop } from "react-device-detect";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const keysToDelete = ["width", "height", "play"];

export default function ExerciseTypeVideo(
  props = { exerciseTypeId: undefined, play: null, fetchVideo: true }
) {
  const { exerciseTypeId, play, width = 100, height = 100, fetchVideo } = props;
  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);

  const { getExerciseVideo, exerciseVideos } = useExerciseVideos();
  useEffect(() => {
    if (exerciseTypeId && fetchVideo) {
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

  useEffect(() => {
    if (play !== null) {
      setShowVideo(play);
    }
  }, [play]);

  return (
    <div
      onMouseEnter={() => {
        if (isDesktop) {
          setShowVideo(true);
        }
      }}
      onMouseLeave={() => {
        if (isDesktop) {
          setShowVideo(false);
        }
      }}
      className="w-[100px]"
      {...propsSubset}
    >
      <LazyVideo
        onSuspend={(e) => {
          document.addEventListener("click", () => e.target.play(), {
            once: true,
          });
        }}
        width={width}
        height={height}
        src={exerciseVideos?.[exerciseTypeId]?.url}
        poster={exerciseVideos?.[exerciseTypeId]?.thumbnailUrl}
        autoPlay={true}
        muted={true}
        loop={true}
        className={classNames(showVideo || isMobile ? "" : "hidden")}
        playsInline={true}
        controls={false}
        ref={videoRef}
      ></LazyVideo>
      <img
        width={width}
        height={height}
        loading="lazy"
        alt="exercise"
        src={exerciseVideos?.[exerciseTypeId]?.thumbnailUrl}
        className={classNames(showVideo || isMobile ? "hidden" : "")}
      ></img>
    </div>
  );
}
