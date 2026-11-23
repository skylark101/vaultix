/** Join truthy class names (no extra dependency). */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}