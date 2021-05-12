import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
    normalizedLinear,
    normalizedLinearDecay,
    normalizedExponential,
    normalizedExponentialDecay,
    standardDeviation,
    mean,
    standardValue,
    normalizeValueBetweenZeroAndOne,
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

    describe('mean', () => {
        it('returns valid value', () => {
            expect(mean([-5, 1, 8, 7, 2])).to.deep.equal(2.6);
        });
    });

    describe('standardDeviation', () => {
        it('returns valid value', () => {
            expect(standardDeviation([-5, 1, 8, 7, 2])).to.deep.equal(4.673328578219169);
            expect(standardDeviation([0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 1])).to.deep.equal(
                0.23748684174075832
            );
        });
    });

    describe('standardValue', () => {
        it('returns valid value', () => {
            const values = [0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 1];
            const m = mean(values);
            const standDev = standardDeviation(values);

            console.log(standDev);

            const standardValues = values.map((value) => {
                return standardValue({
                    value,
                    mean: m,
                    standardDeviation: standDev,
                });
            });

            expect(standardValues).to.deep.equal([
                -2.7791013395195128,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                0.1684303842133035,
                1.4316582658130823,
            ]);
        });
    });
});
