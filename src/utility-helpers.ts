export const chooseHighestUtility = <T>(list: T[], applyFunc: (n: T) => number): { utility: number; params: T } => {
    let utility = -1;
    let params: T = list[0];

    list.forEach((elem) => {
        const currentUtility = applyFunc(elem);

        if (utility < currentUtility) {
            utility = currentUtility;
            params = elem;
        }
    });

    return { utility, params };
};

export const averageUtilities = <T>(list: T[], applyFunc: (n: T) => number): number => {
    let total = 0;
    const iMax = list.length;

    for (let i = 0; i < iMax; i++) {
        total += applyFunc(list[i]);
    }

    return total / iMax;
};

export const sum = (array: Array<number>): number => {
    return array.reduce((a, b) => a + b, 0);
};

export const average = (array: Array<number>): number => {
    return sum(array) / array.length;
};

export const mean = (array: Array<number>): number => {
    return average(array);
};

export const standardDeviation = (array: Array<number>): number => {
    const u = mean(array);
    return Math.sqrt(sum(array.map((x) => (x - u) ** 2)) / array.length);
};

export const weightedAverage = (array: Array<{ value: number; weight: number }>): number => {
    let final = 0;

    array.forEach(({ weight, value }) => {
        final += weight * value;
    });

    return final;
};

export const normalizedLinear = ({ value, max, a = 1 }: { value: number; max: number; a?: number }): number => {
    const x = value / max;
    return a < 1 ? Math.min(1, x / a) : x / a;
};

export const normalizedLinearDecay = ({ value, max, a = 1 }: { value: number; max: number; a?: number }): number => {
    const x = 1 - value / max;
    return a < 1 ? Math.min(1, x / a) : x / a;
};

export const normalizedPyramid = ({ value, max }: { value: number; max: number }): number => {
    const x = value / max;
    if (x < 0.5) {
        return x;
    }
    return 1 - x;
};

export const normalizedExponential = ({ value, max, a = 2 }: { value: number; max: number; a?: number }): number => {
    const x = value / max;

    if (a < 1) {
        throw new Error(`a cannot be less than 1, recieved: ${a}`);
    }
    // eslint-disable-next-line unicorn/prefer-exponentiation-operator
    return Math.pow(x, a);
};

export const normalizedExponentialDecay = ({
    value,
    max,
    a = 2,
}: {
    value: number;
    max: number;
    a?: number;
}): number => {
    const x = 1 - value / max;

    if (a < 1) {
        throw new Error(`a cannot be less than 1, recieved: ${a}`);
    }
    // eslint-disable-next-line unicorn/prefer-exponentiation-operator
    return Math.pow(x, a);
};

export const normalizedLogistic = ({ value, max, a = 1 }: { value: number; max: number; a?: number }): number => {
    const x = value / max;
    // eslint-disable-next-line unicorn/prefer-exponentiation-operator
    return 1 / (1 + Math.pow(Math.E, -1 * a * (4 * Math.E * x - 2 * Math.E)));
};

export const normalizedLogisticDecay = ({ value, max, a = 1 }: { value: number; max: number; a?: number }): number => {
    const x = 1 - value / max;
    // eslint-disable-next-line unicorn/prefer-exponentiation-operator
    return 1 / (1 + Math.pow(Math.E, -1 * a * (4 * Math.E * x - 2 * Math.E)));
};

export const normalizeValueBetweenZeroAndOne = ({
    min,
    max,
    value,
}: {
    min: number;
    max: number;
    value: number;
}): number => {
    if (max - min === 0) {
        return 0;
    }
    return (value - min) / (max - min);
};

export const standardValue = ({
    mean,
    standardDeviation,
    value,
}: {
    mean: number;
    standardDeviation: number;
    value: number;
}): number => {
    const standardValue = (value - mean) / standardDeviation;
    return standardValue;
};
