import { caching, Cache } from "cache-manager";
import { redisStore } from "cache-manager-redis-yet";

export async function setupCache() {
  const useRedis = process.env.USE_REDIS === "true";

  let client: Cache;

  if (!useRedis) {
    client = await caching("memory");
    // eslint-disable-next-line no-console
    console.log("Using in-memory cache");
  } else {
    client = await caching(
      await redisStore({
        socket: {
          host: process.env.REDIS_URL,
          port: parseInt(process.env.REDIS_PORT || "6379"),
          tls: process.env.REDIS_TLS === "true",
        },
      }),
    );
    // eslint-disable-next-line no-console
    console.log("Using Redis cache");
  }

  return client;
}
