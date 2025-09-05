import React from "react";

const Skeleton = ({ className }) => {
   return (
      <div
         className={`animate-pulse bg-gradient-to-r from-neutral-700 to-neutral-800 ${className}`}
      ></div>
   );
};

export default Skeleton;
