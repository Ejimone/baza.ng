/**
 * Convert kobo amount to formatted naira string.
 * formatPrice(2450000) → "₦24,500"
 * formatPrice(0) → "₦0"
 */
export function formatPrice(kobo: number): string {
  const naira = Math.floor(kobo / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Truncate text with ellipsis if longer than maxLength.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Get a greeting based on the current hour.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Format ISO date string to relative time or short date.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Normalize a user-entered phone number to E.164 format.
 * Defaults to NG country code when number is local.
 */
export function normalizePhoneNumber(
  input: string,
  defaultCountryCode = "+234",
): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  let value = trimmed.replace(/[\s\-()]/g, "");
  const defaultCodeDigits = defaultCountryCode.replace(/\D/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  if (value.startsWith("+")) {
    const internationalDigits = value.slice(1).replace(/\D/g, "");

    // Nigerian users often paste +2340XXXXXXXXXX. Strip the trunk 0.
    if (internationalDigits.startsWith(defaultCodeDigits)) {
      const subscriber = internationalDigits
        .slice(defaultCodeDigits.length)
        .replace(/^0/, "");
      return `+${defaultCodeDigits}${subscriber}`;
    }

    return `+${internationalDigits}`;
  }

  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  // Handle 234XXXXXXXXXX without plus sign.
  if (digitsOnly.startsWith(defaultCodeDigits)) {
    const subscriber = digitsOnly
      .slice(defaultCodeDigits.length)
      .replace(/^0/, "");
    return `+${defaultCodeDigits}${subscriber}`;
  }

  if (digitsOnly.startsWith("0")) {
    return `+${defaultCodeDigits}${digitsOnly.slice(1)}`;
  }

  return `+${defaultCodeDigits}${digitsOnly}`;
}

/**
 * Validate E.164 phone number format for OTP auth endpoints.
 */
export function isValidE164Phone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/**
 * Validate Nigerian mobile numbers in E.164 format.
 * Examples: +2349012345678, +2348031234567
 */
export function isValidNigerianPhone(phone: string): boolean {
  return /^\+234[789]\d{9}$/.test(phone);
}

/**
 * Format Nigerian phone input for display while typing.
 * Accepts local/international forms and renders local style: 0901 234 5678.
 */
export function formatNigerianPhoneInput(input: string): string {
  const raw = input.trim();
  if (!raw) return "";

  const normalized = normalizePhoneNumber(raw);

  if (!normalized.startsWith("+234")) {
    return formatNigerianLocalDisplay(raw.replace(/\D/g, "").slice(0, 11));
  }

  const subscriberDigits = normalized.slice(4).replace(/\D/g, "");
  const localDigits = `0${subscriberDigits}`.slice(0, 11);
  return formatNigerianLocalDisplay(localDigits);
}

function formatNigerianLocalDisplay(digits: string): string {
  if (!digits) return "";

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}
