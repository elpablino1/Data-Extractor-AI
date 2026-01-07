import React from 'react';

interface HeaderSectionProps {
    title: string;
    subtitle?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ title, subtitle }) => {
    return (
        <header className="text-center my-12 mb-20 relative px-4">
            <h1
                className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: title }}
            />
            <div className="w-48 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mx-auto rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
            {subtitle && (
                <p
                    className="text-xl md:text-2xl text-gray-300 mt-8 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-md"
                    dangerouslySetInnerHTML={{ __html: subtitle }}
                />
            )}
        </header>
    );
};
