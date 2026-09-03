import { cookies, headers } from "next/headers";

import { VotingGuide } from "@/components/VotingGuide";
import { detectLanguage, getCountryFromHeaders } from "@/lib/language/detect";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_MANUAL_COOKIE,
} from "@/lib/types/language";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [query, cookieStore, requestHeaders] = await Promise.all([
    searchParams,
    cookies(),
    headers(),
  ]);
  const queryLanguage = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const initialLanguage = detectLanguage({
    queryLang: queryLanguage,
    cookieLang: cookieStore.get(LANGUAGE_COOKIE)?.value,
    cookieManual: cookieStore.get(LANGUAGE_MANUAL_COOKIE)?.value,
    acceptLanguage: requestHeaders.get("accept-language"),
    countryCode: getCountryFromHeaders(requestHeaders),
  });

  return <VotingGuide initialLanguage={initialLanguage} />;
}
