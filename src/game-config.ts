export const MAX_NUM_OF_DAYS = 24;
export const HARVEST_TREE_SUN_COST = 4;
export const HARVESTABLE_TREE_SIZE = 3;
export const RICHNESS_1_COMPLETE_BONUS = 0;
export const RICHNESS_2_COMPLETE_BONUS = 2;
export const RICHNESS_3_COMPLETE_BONUS = 4;
export const BASE_GROW_COST_TO_1 = 1;
export const BASE_GROW_COST_TO_2 = 3;
export const BASE_GROW_COST_TO_3 = 7;

export const getNumOfDaysLeft = (days: number): number => {
    return MAX_NUM_OF_DAYS - days;
};

export const getSeedCost = (numOfTreesOfSameSize: number): number => {
    return numOfTreesOfSameSize;
};

export const getTreeGrowCost = (targetSize: number, numOfTreesOfSameSize: number): number => {
    if (targetSize === 1) {
        return BASE_GROW_COST_TO_1 + numOfTreesOfSameSize;
    }
    if (targetSize === 2) {
        return BASE_GROW_COST_TO_2 + numOfTreesOfSameSize;
    }
    if (targetSize === 3) {
        return BASE_GROW_COST_TO_3 + numOfTreesOfSameSize;
    }
    throw new Error(`getTreeBaseGrowCost`);
};

export const getHarvestScoreValue = (nutrients: number, richness: number | null): number => {
    if (richness === null) {
        throw new Error('getHarvestBonus');
    }
    if (richness === 1) {
        return nutrients + RICHNESS_1_COMPLETE_BONUS;
    }
    if (richness === 2) {
        return nutrients + RICHNESS_2_COMPLETE_BONUS;
    }
    if (richness === 3) {
        return nutrients + RICHNESS_3_COMPLETE_BONUS;
    }
    throw new Error(`getHarvestBonus`);
};
