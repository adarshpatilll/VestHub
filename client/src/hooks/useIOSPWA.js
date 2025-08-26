import { useEffect, useState } from "react";

const isIOS = () =>
   /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const isInStandaloneMode = () =>
   window.matchMedia("(display-mode: standalone)").matches ||
   (window.navigator && window.navigator.standalone) === true;

export const useIOSPWA = () => {
   const [isiOSPWA, setIsiOSPWA] = useState(false);

   useEffect(() => {
      if (isIOS() && isInStandaloneMode()) {
         setIsiOSPWA(true);
      }
   }, []);

   return isiOSPWA;
};
