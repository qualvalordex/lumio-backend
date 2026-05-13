import { validateCpfCnpj } from './validate-cpf-cnpj';

describe('validateCpfCnpj', () => {
    describe('CPF', () => {
        it('should return valid for a valid CPF with mask', () => {
            expect(validateCpfCnpj('529.982.247-25')).toEqual({
                valid: true,
                formatted: '529.982.247-25',
                type: 'cpf',
            });
        });

        it('should accept unmasked CPF and return it formatted', () => {
            expect(validateCpfCnpj('52998224725')).toEqual({
                valid: true,
                formatted: '529.982.247-25',
                type: 'cpf',
            });
        });

        it('should return invalid for wrong check digits', () => {
            const result = validateCpfCnpj('123.456.789-00');
            expect(result.valid).toBe(false);
            expect(result.type).toBe('cpf');
        });

        it('should return invalid for all-equal-digit CPF', () => {
            expect(validateCpfCnpj('111.111.111-11').valid).toBe(false);
        });
    });

    describe('CNPJ', () => {
        it('should return valid for a valid CNPJ with mask', () => {
            expect(validateCpfCnpj('11.222.333/0001-81')).toEqual({
                valid: true,
                formatted: '11.222.333/0001-81',
                type: 'cnpj',
            });
        });

        it('should accept unmasked CNPJ and return it formatted', () => {
            expect(validateCpfCnpj('11222333000181')).toEqual({
                valid: true,
                formatted: '11.222.333/0001-81',
                type: 'cnpj',
            });
        });

        it('should return invalid for wrong check digits', () => {
            const result = validateCpfCnpj('11.222.333/0001-00');
            expect(result.valid).toBe(false);
            expect(result.type).toBe('cnpj');
        });

        it('should return invalid for all-equal-digit CNPJ', () => {
            expect(validateCpfCnpj('11.111.111/1111-11').valid).toBe(false);
        });
    });

    describe('unknown length', () => {
        it('should return invalid with type cpf when fewer than 11 digits', () => {
            expect(validateCpfCnpj('12345')).toEqual({ valid: false, formatted: '12345', type: 'cpf' });
        });

        it('should return invalid with type cnpj when between 12 and 13 digits', () => {
            const result = validateCpfCnpj('123456789012');
            expect(result.valid).toBe(false);
            expect(result.type).toBe('cnpj');
        });
    });
});
