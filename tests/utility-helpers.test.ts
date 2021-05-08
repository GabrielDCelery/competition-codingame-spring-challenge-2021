import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
    normalizedLinear,
    normalizedLinearDecay,
    normalizedExponential,
    normalizedExponentialDecay,
} from '../src/utility-helpers';

describe('UtilityHelpers', () => {
    describe('normalizedLinear', () => {
        it('returns valid value', () => {
            expect(normalizedLinear({ value: 0, max: 1 })).to.deep.equal(0);
            expect(normalizedLinear({ value: 0.5, max: 1 })).to.deep.equal(0.5);
            expect(normalizedLinear({ value: 1, max: 1 })).to.deep.equal(1);
        });
    });

    describe('normalizedLinearDecay', () => {
        it('returns valid value', () => {
            expect(normalizedLinearDecay({ value: 0, max: 1 })).to.deep.equal(1);
            expect(normalizedLinearDecay({ value: 0.5, max: 1 })).to.deep.equal(0.5);
            expect(normalizedLinearDecay({ value: 1, max: 1 })).to.deep.equal(0);
        });
    });

    describe('normalizedExponential', () => {
        it('returns valid value', () => {
            expect(normalizedExponential({ value: 0, max: 1 })).to.deep.equal(0);
            expect(normalizedExponential({ value: 0.5, max: 1 })).to.deep.equal(0.25);
            expect(normalizedExponential({ value: 1, max: 1 })).to.deep.equal(1);
        });
    });

    describe('normalizedExponentialDecay', () => {
        it('returns valid value', () => {
            expect(normalizedExponentialDecay({ value: 0, max: 1 })).to.deep.equal(1);
            expect(normalizedExponentialDecay({ value: 0.5, max: 1 })).to.deep.equal(0.25);
            expect(normalizedExponentialDecay({ value: 1, max: 1 })).to.deep.equal(0);
        });
    });
});
