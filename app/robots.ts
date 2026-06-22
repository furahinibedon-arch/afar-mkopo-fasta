import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/staff/", "/borrower/", "/api/"],
    },
    sitemap: "https://afarmkopo.xyz/sitemap.xml",
  };
}
