import React, { useEffect, useState } from "react";
import LazyLoad from "vanilla-lazyload";
import lazyloadConfig from "../utils/lazyload-config";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const keysToDelete = ["srcset", "sizes", "className", "src"];
const LazyVideo = React.forwardRef((props = {}, ref) => {
  const { className, src, srcset, sizes } = props;
  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);
  useEffect(() => {
    if (!document.lazyLoadInstance) {
      document.lazyLoadInstance = new LazyLoad(lazyloadConfig);
    }
    document.lazyLoadInstance.update();
  }, []);

  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (src && hasPlayed && ref.current) {
      const video = ref.current;
      video.src = src;
      setHasPlayed(false);
    }
  }, [src]);

  return (
    <video
      onPlay={(e) => {
        setHasPlayed(true);
      }}
      {...propsSubset}
      ref={ref}
      className={classNames(className || "", "lazy")}
      data-src={src}
      data-srcset={srcset}
      data-sizes={sizes}
    />
  );
});
LazyVideo.displayName = "LazyVideo";
export default LazyVideo;
