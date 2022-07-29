import React, { useEffect, useState } from "react";
import LazyLoad from "vanilla-lazyload";
import lazyloadConfig from "../utils/lazyload-config";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const keysToDelete = ["srcset", "sizes", "className", "src"];
const LazyImage = React.forwardRef((props = {}, ref) => {
  const { className, src, srcset, sizes } = props;
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

  return (
    <img
      {...propsSubset}
      ref={ref}
      className={classNames(className || "", "lazy")}
      data-src={src}
      data-srcset={srcset}
      data-sizes={sizes}
    />
  );
});
LazyImage.displayName = "LazyImage";
export default LazyImage;
