export const validateAccountName = (accountName) => {
    const accountNameRegex = /^[A-Za-z][A-Za-z0-9]*$/;
    return accountNameRegex.test(accountName);
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

export const validateZipcode = (zipcode) => {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zipcode);
};

export const validateDOB = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
  
    // Calculate the age
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
  
    // Adjust for cases where the birth month/day hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 18;
    }
  
    return age >= 18;
  };