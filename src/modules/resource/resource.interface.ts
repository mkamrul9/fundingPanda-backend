export type TResource = {
    name: string;
    description: string;
    type: 'HARDWARE' | 'SOFTWARE';
    totalCapacity?: number;
    categoryIds?: string[];
};