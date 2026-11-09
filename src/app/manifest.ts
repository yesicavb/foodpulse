import type { MetadataRoute } from "next";

/** PWA setup: can be installed on the phone's home screen */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FOODPULSE",
    short_name: "FOODPULSE",
    description: "Prenota i freschi in anticipo, risparmia e riduci lo spreco.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1F7A43",
    lang: "it",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
