import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const SuccessToaster = ({ 
    show, 
    onClose,
    message = 'Operation completed successfully!',
    title = 'Success',
    variant = 'success', // 'success', 'info', 'warning', 'danger'
    duration = 2000,
    position = 'top-end'
}) => {
    // Store the variant when toast is shown to prevent icon flickering
    const [displayVariant, setDisplayVariant] = useState(variant);

    useEffect(() => {
        if (show) {
            // Immediately update the display variant when toast shows
            setDisplayVariant(variant);
            
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, variant, onClose, duration]);

    const getIcon = () => {
        switch (displayVariant) {
            case 'success':
                return 'ri-checkbox-circle-line';
            case 'info':
                return 'ri-information-line';
            case 'warning':
                return 'ri-alert-line';
            case 'danger':
                return 'ri-error-warning-line';
            default:
                return 'ri-checkbox-circle-line';
        }
    };

    const getIconBgClass = () => {
        switch (displayVariant) {
            case 'success':
                return 'bg-success-subtle text-success';
            case 'info':
                return 'bg-info-subtle text-info';
            case 'warning':
                return 'bg-warning-subtle text-warning';
            case 'danger':
                return 'bg-danger-subtle text-danger';
            default:
                return 'bg-success-subtle text-success';
        }
    };

    const getBorderClass = () => {
        switch (displayVariant) {
            case 'success':
                return 'border-success';
            case 'info':
                return 'border-info';
            case 'warning':
                return 'border-warning';
            case 'danger':
                return 'border-danger';
            default:
                return 'border-success';
        }
    };

    const getProgressBarClass = () => {
        switch (displayVariant) {
            case 'success':
                return 'bg-success';
            case 'info':
                return 'bg-info';
            case 'warning':
                return 'bg-warning';
            case 'danger':
                return 'bg-danger';
            default:
                return 'bg-success';
        }
    };

    return (
        <ToastContainer 
            position={position} 
            className="p-3" 
            style={{ zIndex: 9999 }}
        >
            <Toast 
                show={show} 
                onClose={onClose}
                className={`border-start border-3 ${getBorderClass()} shadow-lg`}
                style={{ 
                    minWidth: '320px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)'
                }}
            >
                <Toast.Header 
                    closeButton 
                    className="border-0 pb-2"
                    style={{ backgroundColor: 'transparent' }}
                >
                    <div className="d-flex align-items-center w-100">
                        <div 
                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${getIconBgClass()}`}
                            style={{ 
                                width: '40px', 
                                height: '40px',
                                flexShrink: 0
                            }}
                        >
                            <i className={`${getIcon()} fs-4`}></i>
                        </div>
                        <div className="flex-grow-1">
                            <strong className="d-block mb-0" style={{ fontSize: '0.95rem' }}>
                                {title}
                            </strong>
                        </div>
                    </div>
                </Toast.Header>
                <Toast.Body 
                    className="pt-0 ps-4 pe-3"
                    style={{ 
                        paddingLeft: '4rem',
                        fontSize: '0.875rem',
                        color: '#6c757d'
                    }}
                >
                    {message}
                    
                    {/* Progress bar animation */}
                    <div 
                        className="mt-2" 
                        style={{ 
                            height: '3px',
                            width: '100%',
                            backgroundColor: '#e9ecef',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginLeft: '-3.5rem',
                            marginRight: '-0.75rem'
                        }}
                    >
                        <div 
                            className={getProgressBarClass()}
                            style={{
                                height: '100%',
                                width: '100%',
                                animation: `shrink ${duration}ms linear forwards`,
                                transformOrigin: 'left'
                            }}
                        />
                    </div>
                </Toast.Body>
            </Toast>

            {/* CSS Animation for progress bar */}
            <style>
                {`
                    @keyframes shrink {
                        from {
                            transform: scaleX(1);
                        }
                        to {
                            transform: scaleX(0);
                        }
                    }
                    
                    .toast {
                        animation: slideInRight 0.3s ease-out;
                    }
                    
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </ToastContainer>
    );
};

export default SuccessToaster;