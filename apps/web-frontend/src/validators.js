const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const isValidEmail = (email) => {
  if (!isNonEmptyString(email)) return false;
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

export function validate(values) {
  const errors = {};

  if (!isNonEmptyString(values.firstName)) errors.firstName = "First name is required.";
  if (!isNonEmptyString(values.lastName)) errors.lastName = "Last name is required.";
  if (!isValidContactNumber(values.contact))
    errors.contact = "Contact number must have 7–15 digits.";
  if (!isValidEmail(values.email)) errors.email = "Enter a valid email address.";
  if (!isNonEmptyString(values.address)) errors.address = "Address is required.";
  if (!isNonEmptyString(values.state)) errors.state = "State is required.";
  if (!isNonEmptyString(values.country)) errors.country = "Country is required.";

  if (isIndia(values.country)) {
    if (!isValidIndiaPincode(values.pincode))
      errors.pincode = "Pincode is required for India (6 digits).";
  }

  return errors;
}

export function isIndiaCountry(country) {
  return isIndia(country);
}

