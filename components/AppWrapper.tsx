import React from "react";

const AppWrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div className="text-white bg-black min-h-screen">{children}</div>;
};

export default AppWrapper;
