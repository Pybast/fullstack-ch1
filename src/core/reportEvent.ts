import { CEDE_API_WEBHOOK_ENDPOINT } from "./constants";

const CEDE_API_URL = process.env.CEDE_API_URL || "";

const KUCOIN_POST_TRADE_URL = "https://api.kucoin.com/api/v1/orders";
 const MEXC_POST_TRADE_URL = "https://api.mexc.com/api/v3/order";
 const GATEIO_POST_TRADE_URL = "https://api.gateio.ws/api/v4/spot/orders";
 const BYBIT_POST_TRADE_URL = "https://api.bybit.com/v5/order/create";


let eventsPerHourCounter = 0;
let currentHour = new Date().getHours();

export const reportEvent = async (tradeProxyEvent) => {
  const url = tradeProxyEvent.url;

  const mexcBlockCondition = !url.includes(MEXC_POST_TRADE_URL) || url.includes("orderId");

  if (
    !url.includes(KUCOIN_POST_TRADE_URL) &&
    mexcBlockCondition &&
    !url.includes(GATEIO_POST_TRADE_URL) &&
    !url.includes(BYBIT_POST_TRADE_URL)
  ) {
    return;
  }

  if (new Date().getHours() !== currentHour) {
    eventsPerHourCounter = 0;
    currentHour = new Date().getHours();
  }
  eventsPerHourCounter++;
  // eslint-disable-next-line no-console
  console.log(
    `[TRADES COUNTER] [${currentHour} hour] ${eventsPerHourCounter} trades. Time: ${new Date().toISOString()}`,
  );
  // eslint-disable-next-line no-console
  console.log(`[TRADE EVENT] ${JSON.stringify(tradeProxyEvent)}`);

  await fetch(`${CEDE_API_URL}${CEDE_API_WEBHOOK_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TOKEN": process.env.CEDE_HOOKS_API_TOKEN || "",
    },
    body: JSON.stringify(tradeProxyEvent),
  })
    .then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        // eslint-disable-next-line no-console
        console.error("Failed to send trade event to cede api: ", res);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send trade event to cede api: ", err);
    });
};
