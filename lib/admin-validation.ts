export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD = 128;

function passwordError(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > MAX_PASSWORD) return "Password is too long.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least one letter and one number.";
  }
  return undefined;
}

export function validateLoginFields(email: string, password: string): {
  email?: string;
  password?: string;
} {
  const fields: { email?: string; password?: string } = {};
  if (!email) fields.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) fields.email = "Enter a valid email address.";
  const pwd = passwordError(password);
  if (pwd) fields.password = pwd;
  return fields;
}

export function validatePasswordChange(
  current: string,
  next: string,
  confirm: string,
): { current?: string; next?: string; confirm?: string } {
  const fields: { current?: string; next?: string; confirm?: string } = {};
  if (!current) fields.current = "Current password is required.";
  const nextError = passwordError(next);
  if (nextError) fields.next = nextError;
  if (!confirm) fields.confirm = "Confirm the new password.";
  else if (next && confirm !== next) fields.confirm = "The two new passwords do not match.";
  if (current && next && current === next) {
    fields.next = "Pick a password that is different from the current one.";
  }
  return fields;
}
