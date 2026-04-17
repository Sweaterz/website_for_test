export function normalizeRedirectTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/orders";
  }

  return value;
}
