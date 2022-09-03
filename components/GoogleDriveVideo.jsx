import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const keysToDelete = ["className", "videoId", "width", "height"];
const GoogleDriveVideo = React.forwardRef((props = {}, ref) => {
  const { className, videoId, width, height } = props;

  const propsSubset = Object.assign({}, props);
  keysToDelete.forEach((key) => delete propsSubset[key]);

  return (
    <iframe
      className={classNames("", className)}
      src={`https://drive.google.com/file/d/${videoId}/preview`}
      width={width}
      height={height}
      allow="autoplay"
      ref={ref}
    ></iframe>
  );
});
GoogleDriveVideo.displayName = "GoogleDriveVideo";
export default GoogleDriveVideo;
