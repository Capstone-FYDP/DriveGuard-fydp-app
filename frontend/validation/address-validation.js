export const addressValidation = {
  destAddress: {
    presence: {
      allowEmpty: false,
      message: "^Please enter a valid location",
    },
  },
};

export default addressValidation;
