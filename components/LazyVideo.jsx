import React, { useEffect } from "react";
import LazyLoad from "vanilla-lazyload";
import lazyloadConfig from "../utils/lazyload-config";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function LazyVideo({
  alt,
  src,
  srcset,
  sizes,
  width,
  height,
  playsInline,
  autoPlay,
  muted,
  loop,
  controls,
  className,

  onDragOver,
  onDrop,
  onSuspend,
}) {
  useEffect(() => {
    if (!document.lazyLoadInstance) {
      document.lazyLoadInstance = new LazyLoad(lazyloadConfig);
    }
    document.lazyLoadInstance.update();
  }, []);

  return (
    <video
      alt={alt}
      className={classNames(className, "lazy")}
      data-src={src}
      data-srcset={srcset}
      data-sizes={sizes}
      width={width}
      height={height}
      playsInline={playsInline}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      onSuspend={onSuspend}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}
