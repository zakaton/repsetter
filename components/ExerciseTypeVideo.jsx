import { useEffect, useState, useRef } from "react";
import LazyVideo from "./LazyVideo";
import { useExerciseVideos } from "../context/exercise-videos-context";
import { isMobile, isDesktop } from "react-device-detect";
import LazyImage from "./LazyImage";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const keysToDelete = ["width", "height", "play"];

export default function ExerciseTypeVideo(
  props = { exerciseTypeId: undefined, play: null, fetchVideo: true }
) {
  const {
    exerciseTypeId,
    play,
    width = 100,
    height = 100,
    fetchVideo,
    className = "min-h-[100px] min-w-[100px]",
  } = props;
  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);

  const sizeClassname = `w-[${width}px] h-[${height}px]`;

  const { getExerciseVideo, exerciseVideos } = useExerciseVideos();
  useEffect(() => {
    if (exerciseTypeId && fetchVideo) {
      getExerciseVideo(exerciseTypeId);
    }
  }, [exerciseTypeId]);

  const [showVideo, setShowVideo] = useState(false);

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

  const [shouldShowVideo, setShouldShowVideo] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  useEffect(() => {
    setShouldShowVideo(hasPlayed && showVideo && !isSuspended);
  }, [showVideo, hasPlayed, isSuspended]);

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
      onClick={(e) => {
        const { current: video } = videoRef;
        if (isMobile) {
          console.log("VIDEO TOGGLE", video, video.readyState);
          if (video) {
            if (video.readyState === 0) {
              setShowVideo(true);
            } else if (video.readyState <= 3) {
              video.play();
            } else {
              setShowVideo(!showVideo);
            }
          }
        }
      }}
      className={sizeClassname}
    >
      <LazyVideo
        onSuspend={(e) => {
          setIsSuspended(true);
          document.addEventListener(
            "click",
            async () => {
              await e.target.play();
            },
            {
              once: true,
            }
          );
        }}
        onPlay={() => {
          console.log("onPlay");
          setHasPlayed(true);
          setIsSuspended(false);
        }}
        onCanPlayThrough={(e) => {
          if (!hasLoadedData) {
            console.log("setHasLoadedData", e.target);
            e.target.play();
            setHasLoadedData(true);
          }
        }}
        onPause={() => {
          setHasPlayed(false);
        }}
        width={width}
        height={height}
        src={exerciseVideos?.[exerciseTypeId]?.url}
        poster={exerciseVideos?.[exerciseTypeId]?.thumbnailUrl}
        autoPlay={false}
        muted={true}
        loop={true}
        className={classNames(
          "absolute z-10 overflow-hidden rounded-lg",
          className,
          sizeClassname,
          shouldShowVideo ? "" : "hidden"
        )}
        playsInline={true}
        controls={false}
        ref={videoRef}
      ></LazyVideo>
      <div className={classNames(sizeClassname, className)}>
        {exerciseVideos?.[exerciseTypeId]?.thumbnailUrl && (
          <LazyImage
            width={width}
            height={height}
            alt="exercise"
            src={exerciseVideos?.[exerciseTypeId]?.thumbnailUrl}
            className={classNames("overflow-hidden rounded-lg")}
          ></LazyImage>
        )}
      </div>
    </div>
  );
}
