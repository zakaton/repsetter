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

export async function getWithingsAccessToken(code) {
  const params = new URLSearchParams();
  params.append("action", "requesttoken");
  params.append("grant_type", "authorization_code");
  params.append("client_id", process.env.NEXT_PUBLIC_WITHINGS_CLIENT_ID);
  params.append("client_secret", process.env.WITHINGS_SECRET);
  params.append("code", code);
  params.append(
    "redirect_uri",
    process.env.NEXT_PUBLIC_URL + process.env.NEXT_PUBLIC_WITHINGS_REDIRECT_URI
  );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/v2/oauth2`,
    {
      method: "POST",
      body: params,
    }
  );
  const json = await response.json();
  console.log("withings access token json", json);
  return json;
}
export async function refreshWithingsAccessToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("action", "requesttoken");
  params.append("grant_type", "refresh_token");
  params.append("client_id", process.env.NEXT_PUBLIC_WITHINGS_CLIENT_ID);
  params.append("client_secret", process.env.WITHINGS_SECRET);
  params.append("refresh_token", refreshToken);
  params.append(
    "redirect_uri",
    process.env.NEXT_PUBLIC_URL + process.env.NEXT_PUBLIC_WITHINGS_REDIRECT_URI
  );
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/v2/oauth2`,
    {
      method: "POST",
      body: params,
    }
  );
  const json = await response.json();
  console.log("withings refresh token json", json);
  return json;
}

const withingsAppliList = [1]; // user.metrics
export async function subscribeToWithingsNotifications(accessToken, appli) {
  const params = new URLSearchParams();
  params.append("action", "subscribe");
  params.append(
    "callbackurl",
    process.env.NEXT_PUBLIC_URL +
      process.env.NEXT_PUBLIC_WITHINGS_NOTIFICATIONS_URI
  );
  params.append("appli", appli);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/notify`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await response.json();
  console.log("withings subscribe json", json, appli);
  return json;
}
export async function subscribeToAllWithingsNotifications(accessToken) {
  const jsonResponses = await Promise.all(
    withingsAppliList.map((appli) =>
      subscribeToWithingsNotifications(accessToken, appli)
    )
  );
  return jsonResponses;
}
export async function revokeWithingsNotifications(accessToken, appli) {
  const params = new URLSearchParams();
  params.append("action", "revoke");
  params.append(
    "callbackurl",
    process.env.NEXT_PUBLIC_URL +
      process.env.NEXT_PUBLIC_WITHINGS_NOTIFICATIONS_URI
  );
  params.append("appli", appli);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/notify`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await response.json();
  console.log("withings revoke json", json, appli);
  return json;
}
export async function revokeAllWithingsNotifications(accessToken) {
  const jsonResponses = await Promise.all(
    withingsAppliList.map((appli) =>
      revokeWithingsNotifications(accessToken, appli)
    )
  );
  return jsonResponses;
}

export async function getWithingsMeasure(accessToken, startdate, enddate) {
  console.log("getWithingsMeasure", accessToken, startdate, enddate);
  const params = new URLSearchParams();
  params.append("action", "getmeas");
  params.append("meastypes", "1,6");
  params.append("category", "1");

  if (startdate) {
    params.append("startdate", startdate);
  }
  if (enddate) {
    params.append("enddate", enddate);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/measure`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await response.json();
  console.log("withings getGetmeas json", json);
  return json;
}

export async function listWithingsNotifications(
  accessToken,
  appli = withingsAppliList[0]
) {
  const params = new URLSearchParams();
  params.append("action", "list");
  params.append("appli", appli);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/notify`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const json = await response.json();
  console.log("withings list notifications json", json, appli);
  return json;
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
    `${process.env.NEXT_PUBLIC_WITHINGS_TARGET_ENDPOINT}/v2/signature`,
    { method: "POST", body: params }
  );
  const json = await response.json();
  console.log("nonce json", json);
  return json;
}
