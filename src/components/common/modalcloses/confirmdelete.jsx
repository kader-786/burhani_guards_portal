import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDeleteModal = ({ 
    show, 
    onHide,
    onConfirm,
    title = 'Confirm Delete', 
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    itemName = '',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger' // 'danger', 'warning', 'primary', 'info'
}) => {
    const handleConfirm = () => {
        onConfirm();
        onHide();
    };

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return 'ri-delete-bin-line';
            case 'warning':
                return 'ri-alert-line';
            case 'info':
                return 'ri-information-line';
            case 'primary':
                return 'ri-question-line';
            default:
                return 'ri-delete-bin-line';
        }
    };

    const getIconBgClass = () => {
        switch (variant) {
            case 'danger':
                return 'bg-danger-subtle text-danger';
            case 'warning':
                return 'bg-warning-subtle text-warning';
            case 'info':
                return 'bg-info-subtle text-info';
            case 'primary':
                return 'bg-primary-subtle text-primary';
            default:
                return 'bg-danger-subtle text-danger';
        }
    };

    const getItemBorderClass = () => {
        switch (variant) {
            case 'danger':
                return 'border-danger';
            case 'warning':
                return 'border-warning';
            case 'info':
                return 'border-info';
            case 'primary':
                return 'border-primary';
            default:
                return 'border-danger';
        }
    };

    return (
        <Modal 
            centered 
            show={show} 
            onHide={onHide} 
            keyboard={false} 
            backdrop="static"
            className="modal fade"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title as="h6" className="w-100">
                    <div className="text-center w-100">
                        <div 
                            className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${getIconBgClass()}`}
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className={`${getIcon()} fs-1`}></i>
                        </div>
                        <div className="fw-semibold fs-5 text-dark">
                            {title}
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center pt-0">
                {/* {itemName && (
                    <div 
                        className={`bg-light border-start border-3 ${getItemBorderClass()} rounded p-3 mb-3 fw-semibold text-start`}
                    >
                        "{itemName}"
                    </div>
                )} */}
                <p className="text-muted mb-0">
                    {message}
                </p>
            </Modal.Body>
            <Modal.Footer className="border-0 justify-content-center pb-4">
                <Button 
                    variant="secondary" 
                    onClick={onHide}
                    className="px-4"
                >
                    <i className="ri-close-line me-2"></i>
                    {cancelText}
                </Button>
                <Button 
                    variant={variant} 
                    onClick={handleConfirm}
                    className="px-4"
                >
                    <i className="ri-check-line me-2"></i>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;