const HASH_THEME_TOKENS = [
  "--color-primary",
  "--color-accent",
  "--color-chart-2",
  "--color-chart-3",
  "--color-chart-4",
  "--color-ink",
];

export function hashHue(str) {
  const value = String(str ?? "");
  let h = 0;

  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }

  return h % 360;
}

export function hashedThemeStyle(value, strength = 18) {
  const token = HASH_THEME_TOKENS[hashHue(value) % HASH_THEME_TOKENS.length];

  return {
    background: `color-mix(in srgb, var(${token}) ${strength}%, var(--color-card))`,
    color: "var(--color-foreground)",
  };
}

export function tokenSurfaceStyle(token, strength = 22) {
  return {
    background: `color-mix(in srgb, var(${token}) ${strength}%, var(--color-card))`,
    color: "var(--color-foreground)",
  };
}

export function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name, fallback) =>
    styles.getPropertyValue(name)?.trim() || fallback;

  return {
    card: get("--color-card", "#ffffff"),
    border: get("--color-border-strong", "#bfd0cf"),
    foreground: get("--color-foreground", "#10201f"),
    mutedForeground: get("--color-muted-foreground", "#5b6d6b"),
    primary: get("--color-primary", "#0c7c78"),
    primaryForeground: get("--color-primary-foreground", "#ffffff"),
    chart3: get("--color-chart-3", "#b3432f"),
  };
}
