import React, { useEffect, useState } from "react";
import LazyLoad from "vanilla-lazyload";
import lazyloadConfig from "../utils/lazyload-config";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const keysToDelete = [
  "srcset",
  "sizes",
  "className",
  "src",
  "onPlay",
  "onPause",
  "poster",
];
const LazyVideo = React.forwardRef((props = {}, ref) => {
  const { className, src, srcset, sizes, onPlay, onPause, poster } = props;
  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);
  useEffect(() => {
    if (!document.lazyLoadInstance) {
      document.lazyLoadInstance = new LazyLoad(lazyloadConfig);
    }
    document.lazyLoadInstance.update();
  }, []);

  useEffect(() => {
    document.lazyLoadInstance?.update();
  }, []);

  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (src && hasPlayed && ref.current) {
      const video = ref.current;
      video.src = src;
      setHasPlayed(false);
      onPause();
    }
  }, [src]);

  return (
    <video
      onPlay={(e) => {
        setHasPlayed(true);
        onPlay();
      }}
      poster={poster}
      {...propsSubset}
      ref={ref}
      className={classNames(className || "", "lazy")}
      data-src={src}
      data-srcset={srcset}
      data-sizes={sizes}
      data-poster={poster}
    />
  );
});
LazyVideo.displayName = "LazyVideo";
export default LazyVideo;
