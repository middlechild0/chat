import React from 'react';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default AppWrapper;
