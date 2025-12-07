export type ItemType = 'Lost' | 'Found';
export type ItemCategory = 'wallet' | 'electronic' | 'keys' | 'jewelry' | 'clothing' | 'bag' | 'documents' | 'other';

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description: string;
    category: ItemCategory;
    location: string;
    date: string; // ISO Date string
    contact_netid: string;
}

export const CATEGORIES: ItemCategory[] = [
    'wallet', 'electronic', 'keys', 'jewelry', 'clothing', 'bag', 'documents', 'other'
];
