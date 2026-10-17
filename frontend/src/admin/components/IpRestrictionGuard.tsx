import React from 'react';

interface IpRestrictionGuardProps {
  children: React.ReactNode;
}

/**
 * IpRestrictionGuard
 * IP restriction has been turned off to allow direct admin login from any network.
 */
export const IpRestrictionGuard: React.FC<IpRestrictionGuardProps> = ({ children }) => {
  return <>{children}</>;
};
