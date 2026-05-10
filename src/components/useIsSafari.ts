import { useEffect, useState } from "react";

function detectSafariBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const { userAgent, vendor } = navigator;
  const isAppleWebKit = /Safari/i.test(userAgent) && /Apple Computer/i.test(vendor);
  const isOtherBrowser = /Chrome|CriOS|Edg|OPR|Firefox|FxiOS|SamsungBrowser/i.test(userAgent);

  return isAppleWebKit && !isOtherBrowser;
}

export default function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(detectSafariBrowser());
  }, []);

  return isSafari;
}
