import crypto from "crypto";
import fetch from "node-fetch";

function getUnixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function getWithingsAuthURL(state = "state") {
  const params = new URLSearchParams();
  params.append("response_type", "code");
  params.append("client_id", process.env.NEXT_PUBLIC_WITHINGS_CLIENT_ID);
  params.append("state", state);
  params.append("scope", "user.metrics");
  params.append(
    "redirect_uri",
    process.env.NEXT_PUBLIC_URL + process.env.NEXT_PUBLIC_WITHINGS_REDIRECT_URI
  );
  return process.env.NEXT_PUBLIC_WITHINGS_AUTH_ENDPOINT + "?" + params;
}

export async function getNonce() {
  const params = new URLSearchParams();

  const action = "getnonce";
  const timestamp = getUnixTimestamp();

  params.append("action", action);
  params.append("client_id", process.env.NEXT_PUBLIC_WITHINGS_CLIENT_ID);
  params.append("timestamp", timestamp);

  const signatureString = [
    action,
    process.env.WITHINGS_CLIENT_ID,
    timestamp,
  ].join(",");
  const signature = crypto
    .createHmac("sha256", process.env.WITHINGS_SECRET)
    .update(signatureString)
    .digest("hex");
  console.log(signatureString, signature);
  params.append("signature", signature);

  const response = await fetch(
    `${process.env.WITHINGS_TARGET_ENDPOINT}/v2/signature`,
    { method: "POST", body: params }
  );
  const json = await response.json();
  console.log("json", json);
  return json;
}

// curl --data "action=getnonce&client_id=client_id&timestamp=timestamp&signature=signature" 'https://wbsapi.withings.net/v2/signature'
