type Anchor = {
  text: string;
  url: string;
};

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#\d+;/g, " ");
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龯]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length >= 3)
    .slice(0, 12);
}

function toAbsoluteUrl(href: string, baseUrl: string) {
  try {
    if (!href || href.startsWith("#")) return "";

    if (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return "";
    }

    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractAnchors(html: string, baseUrl: string): Anchor[] {
  const anchors: Anchor[] = [];
  const matches = html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);

  for (const match of matches) {
    const href = match[1];
    const text = stripHtml(match[2]);
    const url = toAbsoluteUrl(href, baseUrl);

    if (!url || !text) continue;

    anchors.push({
      text,
      url,
    });
  }

  return anchors;
}

function isBadExternalUrl(url: string) {
  const lower = url.toLowerCase();

  return (
    lower.includes("facebook.com") ||
    lower.includes("instagram.com") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("linkedin.com") ||
    lower.includes("twitter.com") ||
    lower.includes("x.com") ||
    lower.includes("naver.com/map") ||
    lower.includes("google.com/maps") ||
    lower.includes("calendar.google.com") ||
    lower.includes("add-to-calendar") ||
    lower.includes("ical") ||
    lower.includes("mailto:") ||
    lower.includes("tel:")
  );
}

function sameHost(a: string, b: string) {
  try {
    return new URL(a).hostname.replace(/^www\./, "") === new URL(b).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

function scoreAnchor(anchor: Anchor, title: string, candidate: string) {
  const normalizedAnchor = normalizeText(`${anchor.text} ${anchor.url}`);
  const normalizedTitle = normalizeText(title);
  const normalizedCandidate = normalizeText(candidate);
  const tokens = titleTokens(title);

  let score = 0;

  if (normalizedAnchor.includes(normalizedTitle)) score += 20;
  if (normalizedCandidate.includes(normalizedAnchor)) score += 8;

  for (const token of tokens) {
    if (normalizedAnchor.includes(token)) score += 3;
  }

  if (/event|expo|conference|summit|show|fair|forum|exhibition|컨퍼런스|박람회|전시|행사/i.test(anchor.text)) {
    score += 4;
  }

  if (/read more|detail|details|more info|view|learn more|자세히|상세/i.test(anchor.text)) {
    score += 2;
  }

  if (isBadExternalUrl(anchor.url)) {
    score -= 20;
  }

  return score;
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 BoothScout/1.0 event link resolver; local development",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
      },
    });

    if (!response.ok) return "";

    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function pickBestAnchor(anchors: Anchor[], title: string, candidate: string) {
  return anchors
    .map((anchor) => ({
      anchor,
      score: scoreAnchor(anchor, title, candidate),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.anchor;
}

function pickOfficialExternalLink(
  anchors: Anchor[],
  sourceUrl: string,
  detailUrl: string,
  title: string
) {
  const tokens = titleTokens(title);

  const candidates = anchors
    .filter((anchor) => !sameHost(anchor.url, sourceUrl))
    .filter((anchor) => !sameHost(anchor.url, detailUrl))
    .filter((anchor) => !isBadExternalUrl(anchor.url))
    .map((anchor) => {
      const combined = normalizeText(`${anchor.text} ${anchor.url}`);
      let score = 0;

      for (const token of tokens) {
        if (combined.includes(token)) score += 3;
      }

      if (/official|website|homepage|event site|register|registration|visit|바로가기|공식|홈페이지/i.test(anchor.text)) {
        score += 10;
      }

      if (/event|expo|conference|summit|show|fair|forum|exhibition/i.test(anchor.url)) {
        score += 4;
      }

      return {
        anchor,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.anchor?.url;
}

export async function resolveEventWebsiteForCandidate({
  html,
  sourceUrl,
  title,
  candidate,
}: {
  html: string;
  sourceUrl: string;
  title: string;
  candidate: string;
}) {
  const sourceAnchors = extractAnchors(html, sourceUrl);
  const bestDetailAnchor = pickBestAnchor(sourceAnchors, title, candidate);
  const detailUrl = bestDetailAnchor?.url || sourceUrl;

  if (!detailUrl || detailUrl === sourceUrl) {
    return sourceUrl;
  }

  const detailHtml = await fetchHtml(detailUrl);

  if (!detailHtml) {
    return detailUrl;
  }

  const detailAnchors = extractAnchors(detailHtml, detailUrl);
  const officialExternalLink = pickOfficialExternalLink(
    detailAnchors,
    sourceUrl,
    detailUrl,
    title
  );

  return officialExternalLink || detailUrl;
}
