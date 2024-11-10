import ccxt from "ccxt";

const whitelist = {};
let api;
let prefix;

function addURL(prefix, endpoint, method) {
  const PATTERN = /\{([^}]+)\}/g;
  const CHARS = "(.+)";

  const url = prefix + endpoint;
  const transformedURL = url.replace(PATTERN, CHARS);

  const regexp = new RegExp(`^${transformedURL}`);
  whitelist[method].push(regexp);
}

function whiteListExchangeURLs(api: Record<string, any>, prefix, func) {
  for (let [method, paths] of Object.entries(api)) {
    method = method.toUpperCase();
    if (!(method in whitelist)) {
      whitelist[method] = [];
    }
    for (const path of Object.keys(paths)) {
      const endpoints = func(path);
      for (const endpoint of endpoints) {
        addURL(prefix, endpoint, method);
      }
    }
  }
}

// Add whitelisted URLS for Bitget
{
  const bitget = new ccxt.bitget();

  const hostname = bitget.hostname;
  const privateUrls = bitget.urls["api"];
  const api = bitget.api.private;

  for (const [type, endpoints] of Object.entries(api)) {
    // eslint-disable-next-line no-restricted-syntax
    for (let [method, paths] of Object.entries(endpoints as any)) {
      method = method.toUpperCase();
      if (!(method in whitelist)) {
        whitelist[method] = [];
      }

      prefix = bitget.implodeParams(privateUrls?.[type] || "", { hostname: hostname });
      for (const path of Object.keys(paths as any)) {
        const endpoint = "/api/" + path;
        addURL(prefix, endpoint, method);
      }
    }
  }
}

// Add whitelisted URLS for Bybit
{
  const bybit = new ccxt.bybit();

  const privateUrls = bybit.urls["api"]?.["private"];
  const hostname = bybit.hostname;
  prefix = bybit.implodeParams(privateUrls, { hostname: hostname });
  api = bybit.api.private;

  const BybitFunc = (path) => ["/" + path];

  whiteListExchangeURLs(api, prefix, BybitFunc);
}

// Add whitelisted URLs for OKX
{
  const okx = new ccxt.okx();

  const privateUrls = okx.urls["api"]?.["rest"];
  const hostname = okx.hostname;
  const version = okx.version;
  prefix = okx.implodeParams(privateUrls, { hostname: hostname });

  api = okx.api.private;

  const OKXFunc = (path) => ["/api/" + version + "/" + path];

  whiteListExchangeURLs(api, prefix, OKXFunc);
}

// Add whitelisted URLs for Kucoin
{
  const kucoin = new ccxt.kucoin();

  prefix = kucoin.urls["api"]?.["private"];
  api = kucoin.api.private;
  const KucoinFunc = (path) => ["/api/v1/" + path, "/api/v2/" + path, "/api/v3/" + path];

  whiteListExchangeURLs(api, prefix, KucoinFunc);

  prefix = kucoin.urls["api"]?.["futuresPrivate"];
  api = kucoin.api.futuresPrivate;
  whiteListExchangeURLs(api, prefix, KucoinFunc);
}

// Add whitelisted URLs for HTX
{
  const htx = new ccxt.htx();
  const whitelistedAPINames = ["spot", "contract"];

  whitelistedAPINames.forEach((apiName) => {
    const apiObject = htx.urls["api"]?.[apiName];
    const hostname = htx.urls["hostnames"][apiName];

    prefix = htx.implodeParams(apiObject, { hostname: hostname });
    api = htx.api[apiName].private;
    const HTXFunc = (path) => ["/" + path];
    whiteListExchangeURLs(api, prefix, HTXFunc);
  });
}

// Add whitelisted URLs for Gate.io
{
  const gateio = new ccxt.gateio();
  api = gateio.api.private;

  for (const [type, endpoints] of Object.entries(api)) {
    for (let [method, paths] of Object.entries(endpoints as any)) {
      method = method.toUpperCase();
      if (!(method in whitelist)) {
        whitelist[method] = [];
      }
      for (const path of Object.keys(paths as any)) {
        const endPart = path === "" ? "" : "/" + path;
        let endpoint = "/" + type + endPart;
        if (type === "subAccounts" || type === "withdrawals") {
          endpoint = endPart;
        }
        const prefix = gateio.urls["api"]?.["private"][type];
        addURL(prefix, endpoint, method);
      }
    }
  }
}


// Add whitelisted URLs for Binance
{
  whitelist["POST"].push(/^https:\/\/api.binance.com\/sapi\/v1\/capital\/withdraw\/apply/);

  whitelist["POST"].push(/^https:\/\/api.binance.com\/sapi\/v1\/asset\/transfer/);

  whitelist["POST"].push(/^https:\/\/api.binance.com\/sapi\/v1\/account\/enableFastWithdrawSwitch/);
}

// Add whitelisted URLS for MEXC
{
  const mexc = new ccxt.mexc();
  const whitelistedAPINames = ["spot", "spot2", "contract", "broker"];
  whitelistedAPINames.forEach((apiName) => {
    const prefix = mexc.urls["api"]?.[apiName]["private"];
    const api = mexc.api[apiName].private;
    let MEXCFunc;
    if (apiName === "spot") {
      MEXCFunc = (path) => ["/api/" + mexc.version + "/" + path];
    } else {
      MEXCFunc = (path) => ["/" + path];
    }
    whiteListExchangeURLs(api, prefix, MEXCFunc);
  });
  // whitelisting sub-account balances endpoint
  addURL("https://api.mexc.com/api/v3/sub-account", "/asset", "GET");
}

export default whitelist;
