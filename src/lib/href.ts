export function pathOf(href: string) {
  return href.split("?")[0];
}

export function searchOf(href: string): Record<string, string> | undefined {
  const raw = href.split("?")[1];
  if (!raw) return undefined;
  const q = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  q.forEach((v, k) => {
    out[k] = v;
  });
  return Object.keys(out).length ? out : undefined;
}
