import React from 'react';
import { Button } from 'react-bootstrap';
import './StandardModal.css';

/**
 * StandardModal - Reusable modal component with fixed header/footer and scrollable content
 * 
 * @param {boolean} show - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title text
 * @param {string} icon - Remix icon class (e.g., 'ri-add-circle-line')
 * @param {React.ReactNode} children - Modal content
 * @param {Array} buttons - Array of button configs: [{ label, variant, icon, onClick, disabled }]
 * @param {boolean} loading - Shows loading overlay when true
 * @param {string} badge - Optional badge text (e.g., "Existing Record")
 * @param {string} maxWidth - Optional max width (default: '1200px')
 */
const StandardModal = ({ 
    show, 
    onClose, 
    title, 
    icon = 'ri-add-circle-line',
    children, 
    buttons = [],
    loading = false,
    badge = null,
    maxWidth = '1200px'
}) => {
    
    if (!show) return null;

    return (
        <div className="standard-modal-overlay" onClick={onClose}>
            <div 
                className="standard-modal-container" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth }}
            >
                {/* Loading Overlay */}
                {loading && (
                    <div className="standard-modal-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Fixed Header */}
                <div className="standard-modal-header">
                    <div className="standard-modal-title">
                        <i className={`${icon} me-2`}></i>
                        {title}
                        {badge && <span className="standard-modal-badge">{badge}</span>}
                    </div>
                    <button 
                        className="standard-modal-close" 
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="standard-modal-content">
                    {children}
                </div>

                {/* Fixed Footer */}
                {buttons.length > 0 && (
                    <div className="standard-modal-footer">
                        {buttons.map((btn, index) => (
                            <Button
                                key={index}
                                variant={btn.variant || 'primary'}
                                onClick={btn.onClick}
                                disabled={btn.disabled || loading}
                                className={btn.className || ''}
                            >
                                {btn.icon && <i className={`${btn.icon} me-1`}></i>}
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StandardModal;