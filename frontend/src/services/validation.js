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