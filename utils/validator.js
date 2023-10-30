import { commonPasswords } from "../utils/commonPassword.js";
const isVAlidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};
const isValidatePassword = (password) => {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 20 ||
    commonPasswords.includes(password)
  ) {
    return false;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return passwordRegex.test(password);
};

export default { isVAlidEmail, isValidatePassword };
