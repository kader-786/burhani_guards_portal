import React from 'react';

// Reusable IconButton Component
const IconButton = ({ 
  variant = 'primary', 
  icon, 
  rounded = false, 
  outline = false, 
  transparent = false,
  className = '',
  onClick,
  ...props 
}) => {
  // Build the variant string based on props
  let variantClass = variant;
  if (outline) {
    variantClass = `outline-${variant}`;
  } else if (transparent) {
    variantClass = `${variant}-transparent`;
  }
  
  // Build className
  const buttonClasses = [
    'btn',
    'btn-icon',
    'btn-wave',
    rounded ? 'rounded-pill' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={`btn btn-${variantClass} ${buttonClasses}`}
      onClick={onClick}
      {...props}
    >
      <i className={icon}></i>
    </button>
  );
};

// Button Group Component for organizing buttons
const IconButtonGroup = ({ children, className = '' }) => (
  <div className={`mb-md-0 mb-2 ${className}`}>
    {children}
  </div>
);



export default {IconButtonGroup, IconButton};