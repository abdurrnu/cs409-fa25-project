import { Item } from './types';

// Mock data store
let mockItems: Item[] = [
    {
        id: '1',
        type: 'Lost',
        title: 'Blue Wallet',
        description: 'Lost my blue leather wallet near the library.',
        category: 'wallet',
        location: 'Grainger Library',
        date: new Date().toISOString(),
        contact_netid: 'jdoe2'
    },
    {
        id: '2',
        type: 'Found',
        title: 'iPhone 13',
        description: 'Found an iPhone with a black case.',
        category: 'electronic',
        location: 'Siebel Center',
        date: new Date().toISOString(),
        contact_netid: 'asmith3'
    }
];

export const api = {
    login: async (email: string): Promise<{ success: boolean; error?: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!email.endsWith('@illinois.edu')) {
            return { success: false, error: 'Email must be an @illinois.edu address' };
        }
        return { success: true };
    },

    getItems: async (): Promise<Item[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...mockItems];
    },

    addItem: async (item: Omit<Item, 'id'>): Promise<Item> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newItem: Item = {
            ...item,
            id: Math.random().toString(36).substr(2, 9)
        };
        mockItems = [newItem, ...mockItems];
        return newItem;
    }
};
