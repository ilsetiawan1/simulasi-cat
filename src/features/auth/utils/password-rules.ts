export interface PasswordRuleStatus {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumberOrSymbol: boolean;
  isValid: boolean;
}

export interface PasswordRuleItem {
  key: keyof Omit<PasswordRuleStatus, "isValid">;
  label: string;
}

export const PASSWORD_RULE_ITEMS: readonly PasswordRuleItem[] = [
  { key: "minLength", label: "Minimal 8 karakter" },
  { key: "hasLowercase", label: "Minimal 1 huruf kecil (a–z)" },
  { key: "hasUppercase", label: "Minimal 1 huruf besar (A–Z)" },
  { key: "hasNumberOrSymbol", label: "Minimal 1 angka atau simbol" },
] as const;

/**
 * Evaluasi aturan kekuatan kata sandi tanpa RegEx (Zero RegEx policy).
 */
export function evaluatePasswordRules(password: string): PasswordRuleStatus {
  let hasLowercase = false;
  let hasUppercase = false;
  let hasNumberOrSymbol = false;

  for (let i = 0; i < password.length; i += 1) {
    const code = password.charCodeAt(i);
    const isLower = code >= 97 && code <= 122;
    const isUpper = code >= 65 && code <= 90;

    if (isLower) {
      hasLowercase = true;
    } else if (isUpper) {
      hasUppercase = true;
    } else {
      hasNumberOrSymbol = true;
    }
  }

  const minLength = password.length >= 8;
  const isValid = minLength && hasLowercase && hasUppercase && hasNumberOrSymbol;

  return {
    minLength,
    hasLowercase,
    hasUppercase,
    hasNumberOrSymbol,
    isValid,
  };
}
