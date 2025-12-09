import React, { useState } from 'react';
import { api, User } from './api';
import { ItemType, ItemCategory, CATEGORIES } from './types';
import './PostItemModal.css';

interface PostItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded: () => void;
    user: User; // full User object
}

export const PostItemModal: React.FC<PostItemModalProps> = ({ 
    isOpen, 
    onClose, 
    onItemAdded, 
    user 
}) => {
    const [type, setType] = useState<ItemType>('Lost');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ItemCategory>('other');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const netid = user.email.split('@')[0];

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'Lost') {
                await api.postLostItem({
                    title,
                    description,
                    location,
                    date_lost: date,    // "YYYY-MM-DD"
                    user_id: user.id,
                });
            } else {
                await api.postFoundItem({
                    title,
                    description,
                    location,
                    date_found: date,   // "YYYY-MM-DD"
                    user_id: user.id,
                });
            }

            onItemAdded();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
        } catch (error) {
            console.error('Failed to add item', error);
            alert('Failed to post item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Post {type} Item</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-toggle">
                        <label>I ...</label>
                        <div className="toggle-options">
                            <button
                                type="button"
                                className={type === 'Lost' ? 'active lost' : ''}
                                onClick={() => setType('Lost')}
                            >
                                Lost an Item
                            </button>
                            <button
                                type="button"
                                className={type === 'Found' ? 'active found' : ''}
                                onClick={() => setType('Found')}
                            >
                                Found an Item
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Blue Nike Backpack"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={category}
                            onChange={e => 
                                setCategory(e.target.value as ItemCategory)
                            }
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            placeholder="Describe the item details..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                required
                                placeholder="Where was it?"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date {type === 'Lost' ? 'Lost' : 'Found'}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contact Info (NetID)</label>
                        <input 
                            type="text" 
                            value={netid} 
                            disabled 
                            className="disabled-input" />
                        <small>Users will contact you via {netid}@illinois.edu</small>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-btn" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Posting...' : 'Post Item'}
                            </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
