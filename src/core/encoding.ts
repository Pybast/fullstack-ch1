import zlib from "zlib";

export const decodeBuffer = (buffer: Buffer, contentEncoding: string | undefined) => {
  let decodedBody: string | undefined;
  if (contentEncoding === "gzip") {
    decodedBody = zlib.gunzipSync(buffer).toString();
  } else if (contentEncoding === "br") {
    decodedBody = zlib.brotliDecompressSync(buffer).toString();
  } else if (contentEncoding === "deflate") {
    decodedBody = zlib.inflateSync(buffer).toString();
  } else {
    decodedBody = buffer.toString();
  }
  return decodedBody;
};
