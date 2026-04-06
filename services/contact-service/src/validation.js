const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const isValidEmail = (email) => {
  if (!isNonEmptyString(email)) return false;
  // Simple, pragmatic email check (enough for learning/demo).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const isValidContactNumber = (contact) => {
  if (!isNonEmptyString(contact)) return false;
  const digits = contact.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const isIndia = (country) => normalizeString(country).toLowerCase() === "india";

const isValidIndiaPincode = (pincode) => {
  if (!isNonEmptyString(pincode)) return false;
  return /^\d{6}$/.test(pincode.trim());
};

export function validateContactPayload(payload) {
  const errors = {};

  const firstName = normalizeString(payload?.firstName);
  const lastName = normalizeString(payload?.lastName);
  const contact = normalizeString(payload?.contact);
  const email = normalizeString(payload?.email);
  const address = normalizeString(payload?.address);
  const state = normalizeString(payload?.state);
  const country = normalizeString(payload?.country);
  const pincode = normalizeString(payload?.pincode);

  if (!isNonEmptyString(firstName)) errors.firstName = "First name is required.";
  if (!isNonEmptyString(lastName)) errors.lastName = "Last name is required.";
  if (!isValidContactNumber(contact))
    errors.contact = "Contact number must have 7–15 digits (spaces/dashes allowed).";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNonEmptyString(address)) errors.address = "Address is required.";
  if (!isNonEmptyString(state)) errors.state = "State is required.";
  if (!isNonEmptyString(country)) errors.country = "Country is required.";

  if (isIndia(country)) {
    if (!isValidIndiaPincode(pincode))
      errors.pincode = "Pincode is required for India (6 digits).";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    value: {
      firstName,
      lastName,
      contact,
      email,
      address,
      state,
      country,
      pincode: isIndia(country) ? pincode : ""
    }
  };
}

