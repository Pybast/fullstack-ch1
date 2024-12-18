import bodyParser from "body-parser";
import express from "express";
import "./core/env";
import { corsAnywhereMiddleware } from "./proxy/cors-anywhere";
import rateLimit from "./proxy/rate-limit";

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(`
    RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB,
    Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB,
    Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB,
    External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB
  `);
}, 1000); // Log every 1 second

async function main() {
  // Listen on a specific host via the HOST environment variable
  const host: string = process.env.HOST || "0.0.0.0";
  // Listen on a specific port via the PORT environment variable
  const port: number = Number(process.env.PORT) || 8080;

  // Grab the blacklist from the command-line so that we can update the blacklist without deploying
  // again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
  // immediate abuse (e.g. denial of service). If you want to block all origins except for some,
  // use originWhitelist instead.
  const originBlacklist = parseEnvList(process.env.CORSAnyWHERE_BLACKLIST);
  const originWhitelist = parseEnvList(process.env.CORSAnyWHERE_WHITELIST);
  function parseEnvList(env) {
    if (!env) {
      return [];
    }
    return env.split(",");
  }

  // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
  const checkRateLimit = rateLimit(process.env.CORSAnyWHERE_RATELIMIT);

  const app = express();

  app.use(
    corsAnywhereMiddleware({
      originBlacklist: originBlacklist,
      originWhitelist: originWhitelist,
      checkRateLimit: checkRateLimit,
      removeHeaders: [
        "cookie",
        "cookie2",
        "x-request-start",
        "x-request-id",
        "via",
        "connect-time",
        "total-route-time",
        "x-forwarded-for",
      ],
      httpProxyOptions: {
        xfwd: false,
      },
    }),
  );

  app.use(bodyParser.json());

  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on ${host}:${port}`);
  });
}

main();
