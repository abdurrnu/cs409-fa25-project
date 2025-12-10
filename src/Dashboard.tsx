import React, { useState, useEffect } from 'react';
import { api, User } from './api';
import { Item, ItemCategory, CATEGORIES } from './types';
import { PostItemModal } from './PostItemModal';
import './Dashboard.css';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Lost' | 'Found'>('All');
    const [filterCategory, setFilterCategory] = useState<ItemCategory | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await api.getAllItems(); // AnyItem[]

            const defaultCategory: ItemCategory = CATEGORIES[0];

            const mapped: Item[] = data.map((item) => {
                const rawDate = 
                    (item as any).date_lost ??
                    (item as any).date_found ??
                    item.created_at;
                
                const date = typeof rawDate === 'string'
                    ? rawDate
                    : new Date(rawDate).toISOString();

                const backendCategory = (item as any).category as ItemCategory | undefined;
                const backendContactEmail = (item as any).contact_email as string | undefined;
                
                return {
                    id: String(item.id),    // Item.id is a string in UI model
                    title: item.title,
                    description: item.description,
                    location: item.location,
                    type: item.type, // "Lost" | "Found"
                    date,
                    category: backendCategory ?? defaultCategory,
                    contact_netid: backendContactEmail
                        ? backendContactEmail.split('@')[0]
                        : `user${item.user_id}`, // fallback if no email
                    status: (item as any).status // from backend ("pending" | "finished")
                };
            });

            setItems(mapped);
        } catch (error) {
            console.error('Failed to load items', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

        // LOST items: only show while pending
    // FOUND items: always shown (or you can later hide finished too)
        const isVisibleByStatus =
        item.type === 'Lost'
            ? item.status === 'pending'
            : true; // Found items always visible for now
        

        return matchesSearch && matchesType && matchesCategory && isVisibleByStatus;
    });

    const netid = user.email.split('@')[0];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <img 
                        src={require('./assets/Illinois_Block_I.png')} 
                        alt="UIUC Logo" 
                        style={{ height: '50px', marginRight: '15px' }} 
                    />
                    <div>
                        <h1>Find &amp; Seek</h1>
                        <span className="user-welcome">Hello, {netid}</span>
                    </div>
                </div>
                <div className="header-right">
                    <button className="post-btn" onClick={() => setIsModalOpen(true)}>
                        + Post Item
                    </button>
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search items or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <div className="type-toggle">
                        <button
                            className={filterType === 'All' ? 'active' : ''}
                            onClick={() => setFilterType('All')}
                        >
                            All
                        </button>
                        <button
                            className={filterType === 'Lost' ? 'active' : ''}
                            onClick={() => setFilterType('Lost')}
                        >
                            Lost
                        </button>
                        <button
                            className={filterType === 'Found' ? 'active' : ''}
                            onClick={() => setFilterType('Found')}
                        >
                            Found
                        </button>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => 
                            setFilterCategory(e.target.value as ItemCategory | 'All')}
                        className="category-select"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="items-grid">
                {loading ? (
                    <p>Loading items...</p>
                ) : filteredItems.length === 0 ? (
                    <p className="no-items">No items found matching your criteria.</p>
                ) : (
                    filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            className={`item-card ${item.type.toLowerCase()}`}
                        >
                            <div className="item-badge">{item.type}</div>
                            <h3>{item.title}</h3>
                            <p className="item-desc">{item.description}</p>
                            <div className="item-details">
                                <span>
                                    📍 {item.location}
                                </span>
                                <span>
                                    📅 {new Date(item.date).toLocaleDateString()}
                                </span>
                                <span>
                                    🏷️ {item.category}
                                </span>
                            </div>
                            <div className="item-contact">
                                📧 {item.contact_netid}@illinois.edu
                            </div>

                            {item.type === 'Lost' && item.status === 'pending' && (
                                <button
                                    className="claim-btn"
                                    onClick={async () => {
                                        try {
                                            await api.claimItem(Number(item.id), user.id, "Claimed via dashboard");
                                            alert('Claim submitted successfully!');
                                            await loadItems();  // refresh list from backend
                                        } catch (err: any) {
                                            alert(err?.message || 'Failed to claim item');
                                        }
                                    }}
                                >
                                    Claim Item
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <PostItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onItemAdded={loadItems}
                user={user}
            />
        </div>
    );
};
