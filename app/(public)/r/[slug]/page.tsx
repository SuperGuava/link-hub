import { notFound, redirect } from "next/navigation";

import { LinkUnavailable } from "@/features/links/components/link-unavailable";
import { resolveLinkForRedirect } from "@/server/links/resolve-link";

type RedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params;
  const result = await resolveLinkForRedirect(slug);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return <LinkUnavailable message={result.message} />;
  }

  redirect(result.originalUrl);
}
