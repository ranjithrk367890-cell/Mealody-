import React from 'react';

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  className?: string;
  itemCount?: number;
}

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({ 
  children, 
  className = '', 
  itemCount = 0 
}) => {
  // Center content when item count is low (e.g. less than 3 items on larger viewports)
  const shouldCenter = itemCount > 0 && itemCount < 3;

  return (
    <div 
      className={`w-full items-stretch transition-all duration-500 ease-in-out ${
        shouldCenter ? 'flex flex-wrap justify-center' : 'grid'
      } ${className}`}
      style={{
        display: shouldCenter ? 'flex' : 'grid',
        gridTemplateColumns: shouldCenter ? undefined : 'repeat(auto-fit, minmax(320px, 1fr))',
        gridAutoFlow: shouldCenter ? undefined : 'dense',
        gap: '24px',
        justifyContent: 'center',
        alignItems: 'stretch'
      }}
    >
      {shouldCenter ? (
        React.Children.map(children, (child) => (
          <div style={{ width: '100%', maxWidth: '360px', flex: '1 1 320px', display: 'flex' }} className="items-stretch h-full">
            {child}
          </div>
        ))
      ) : (
        children
      )}
    </div>
  );
};

export default ResponsiveCardGrid;
