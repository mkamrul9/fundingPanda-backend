export type TResource = {
    name: string;
    type?: string;
    description: string;
    totalQuantity?: number;
    availableQuantity?: number;
    lenderId: string; // The ID of the SPONSOR listing the resource
};