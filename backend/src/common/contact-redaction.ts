/** Removes known candidate contact values and generic contact patterns from free text. */
export function redactContactText(text: string | null, secrets: readonly (string | null)[]): string | null {
  if (text === null) return null;
  let result = text;
  for (const secret of secrets.filter((x): x is string => Boolean(x && x.length >= 3)).sort((a, b) => b.length - a.length)) {
    const pattern = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(pattern, 'giu'), '[скрыто]');
  }
  return result.replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu, '[контакт скрыт]')
    .replace(/(?<!\d)\+?\d[\d ()-]{8,}\d(?!\d)/g, '[контакт скрыт]')
    .replace(/(?<![\p{L}\p{N}])@[A-Za-z0-9_]{5,}/gu, '[контакт скрыт]');
}
