import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Item, ItemCategory, CATEGORIES } from './types';
import { PostItemModal } from './PostItemModal';
import './Dashboard.css';

interface DashboardProps {
    user: string;
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
            const data = await api.getItems();
            setItems(data);
        } catch (error) {
            console.error('Failed to load items', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <img src={require('./assets/Illinois_Block_I.png')} alt="UIUC Logo" style={{ height: '50px', marginRight: '15px' }} />
                    <div>
                        <h1>Find & Seek</h1>
                        <span className="user-welcome">Hello, {user}</span>
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
                        >All</button>
                        <button
                            className={filterType === 'Lost' ? 'active' : ''}
                            onClick={() => setFilterType('Lost')}
                        >Lost</button>
                        <button
                            className={filterType === 'Found' ? 'active' : ''}
                            onClick={() => setFilterType('Found')}
                        >Found</button>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as ItemCategory | 'All')}
                        className="category-select"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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
                        <div key={item.id} className={`item-card ${item.type.toLowerCase()}`}>
                            <div className="item-badge">{item.type}</div>
                            <h3>{item.title}</h3>
                            <p className="item-desc">{item.description}</p>
                            <div className="item-details">
                                <span>📍 {item.location}</span>
                                <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                                <span>🏷️ {item.category}</span>
                            </div>
                            <div className="item-contact">
                                📧 {item.contact_netid}@illinois.edu
                            </div>
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
