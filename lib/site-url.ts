export function getSiteOrigin(): string {
  const url =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3002";

  return url.replace(/\/$/, "");
}

export function getShortLinkPath(slug: string): string {
  return `/r/${slug}`;
}

export function getShortLinkUrl(slug: string): string {
  return `${getSiteOrigin()}${getShortLinkPath(slug)}`;
}
