export async function onRequest({ request }) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, "https://sos-api-fglv.onrender.com");
  return fetch(new Request(target, request));
}
