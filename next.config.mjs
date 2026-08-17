const isProd = process.env.NODE_ENV === "production";
export default {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/tiny-internet-museum" : "",
  assetPrefix: isProd ? "/tiny-internet-museum/" : "",
  images: { unoptimized: true },
};
