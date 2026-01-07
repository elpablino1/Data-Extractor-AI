import React from 'react';
import { ReportBuilder } from '../ReportBuilder';

interface Layout2ColProps {
    children: any[];
}

export const Layout2Col: React.FC<Layout2ColProps> = ({ children }) => {
    if (!children || children.length === 0) return null;

    // If only one child, render it full width
    if (children.length === 1) {
        return (
            <div className="w-full">
                <ReportBuilder data={{ infographic: [children[0]] }} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="w-full">
                <ReportBuilder data={{ infographic: [children[0]] }} />
            </div>
            <div className="w-full">
                <ReportBuilder data={{ infographic: [children[1]] }} />
            </div>
        </div>
    );
};
