import React, { createContext, useContext, useState } from 'react';
import { LicenseService, type LicenseStatus } from '../services/licenseService';

interface LicenseContextType {
    license: LicenseStatus | null;
    loading: boolean;
    activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
    deactivateLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [license, setLicense] = useState<LicenseStatus | null>(() => LicenseService.getStoredLicense());
    const [loading] = useState(false);

    // We kept loading state in case we want to add async validation in the future,
    // currently it defaults to false since we read directly from storage.


    const activateLicense = async (key: string) => {
        const result = await LicenseService.activate(key);
        if (result.success && result.data) {
            setLicense(result.data);
        }
        return result;
    };

    const deactivateLicense = () => {
        LicenseService.deactivate();
        setLicense(null);
    };

    return (
        <LicenseContext.Provider value={{ license, loading, activateLicense, deactivateLicense }}>
            {children}
        </LicenseContext.Provider>
    );
};

export const useLicense = () => {
    const context = useContext(LicenseContext);
    if (context === undefined) {
        throw new Error('useLicense must be used within a LicenseProvider');
    }
    return context;
};
