/**
 * Same rules as the API's PasswordValidator (MiCash.Application/UseCases/Users/PasswordValidator.cs).
 * Note: the API only accepts ! ? * . as special characters.
 */
export const PASSWORD_RULES = [
  { label: "8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Número", test: (p: string) => /[0-9]/.test(p) },
  { label: "Símbolo (! ? * .)", test: (p: string) => /[!?*.]/.test(p) },
] as const;

export function passwordScore(password: string) {
  return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
}

export const PASSWORD_ERROR =
  "Use 8 ou mais caracteres, com letra maiúscula, minúscula, número e um destes símbolos: ! ? * .";

export function isStrongPassword(password: string) {
  return passwordScore(password) === PASSWORD_RULES.length;
}
