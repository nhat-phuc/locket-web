"use client";

import { useEffect, useState } from "react";

interface SiteImages {
  logo_url: string;
  loader_url: string;
  home_banner_url: string;
}

const DEFAULT: SiteImages = {
  logo_url: "/img/logo/logo.jpg",
  loader_url: "/img/logo/logo.jpg",
  home_banner_url: "/img/logo/banner.jpg",
};

let cache: SiteImages | null = null;

export function useSiteImages() {
  const [images, setImages] = useState<SiteImages>(cache || DEFAULT);

  useEffect(() => {
    if (cache) { setImages(cache); return; }
    fetch("/api/site-images")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.images) {
          const merged = { ...DEFAULT, ...d.images };
          cache = merged;
          setImages(merged);
        }
      })
      .catch(() => {});
  }, []);

  return images;
}

export function refreshSiteImages() {
  cache = null;
}
