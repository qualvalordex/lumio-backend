export function validateCpfCnpj(value: string): {
    valid: boolean;
    formatted: string;
    type: 'cpf' | 'cnpj';
} {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) {
        return {
            valid: isCpfValid(digits),
            formatted: digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
            type: 'cpf',
        };
    }

    if (digits.length === 14) {
        return {
            valid: isCnpjValid(digits),
            formatted: digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
            type: 'cnpj',
        };
    }

    return { valid: false, formatted: value, type: digits.length <= 11 ? 'cpf' : 'cnpj' };
}

function isCpfValid(digits: string): boolean {
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calcDigit = (slice: string, factor: number) => {
        const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * (factor - i), 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
        calcDigit(digits.slice(0, 9), 10) === parseInt(digits[9]) &&
        calcDigit(digits.slice(0, 10), 11) === parseInt(digits[10])
    );
}

function isCnpjValid(digits: string): boolean {
    if (/^(\d)\1{13}$/.test(digits)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const calcDigit = (slice: string, weights: number[]) => {
        const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    return (
        calcDigit(digits.slice(0, 12), weights1) === parseInt(digits[12]) &&
        calcDigit(digits.slice(0, 13), weights2) === parseInt(digits[13])
    );
}
