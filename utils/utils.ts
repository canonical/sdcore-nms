export const passwordIsValid = (pw: string) => {
    if (pw.length < 8) return false

    const result = {
        hasCapital: false,
        hasLowercase: false,
        hasSymbol: false,
        hasNumber: false
    };

    if (/[A-Z]/.test(pw)) {
        result.hasCapital = true;
    }
    if (/[a-z]/.test(pw)) {
        result.hasLowercase = true;
    }
    if (/[0-9]/.test(pw)) {
        result.hasNumber = true;
    }
    if (/[^A-Za-z0-9]/.test(pw)) {
        result.hasSymbol = true;
    }

    return (result.hasCapital && result.hasLowercase && (result.hasSymbol || result.hasNumber))
}