export const signupValidation = {
  firstName: {
    presence: {
      allowEmpty: false,
      message: '^Please enter a first name',
    },
    format: {
      pattern: "[a-zA-Z]+",
      message: "^Your first name must only contain letters",
    },
  },
  lastName: {
    presence: {
      allowEmpty: false,
      message: '^Please enter an email address',
    },
    format: {
      pattern: "[a-zA-Z]+",
      message: "^Your last name must only contain letters",
    },
  },
  email: {
    presence: {
      allowEmpty: false,
      message: '^Please enter an email address',
    },
    email: {
      message: '^Please enter a valid email address',
    },
  },
  password: {
    presence: {
      allowEmpty: false,
      message: '^Please enter a password',
    },
    length: {
      minimum: 8,
      message: '^Your password must contain at least 8 characters',
    },
  },
  confirmPassword: {
    equality: {
      attribute: 'password',
      message: '^Your passwords do not match',
    },
  },
};

export default signupValidation;
