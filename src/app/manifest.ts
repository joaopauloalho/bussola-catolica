import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bússola Católica — Londrina",
    short_name: "Bússola",
    description:
      "Missas, confissões e adoração nas paróquias e capelas de Londrina.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ec",
    theme_color: "#10243f",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
