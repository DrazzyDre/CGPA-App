import React, { useState } from 'react';

const YearSelector: React.FC<{ onYearChange: (years: number) => void }> = ({ onYearChange }) => {
    const [selectedYear, setSelectedYear] = useState<number>(4);

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const years = parseInt(event.target.value);
        setSelectedYear(years);
        onYearChange(years);
    };

    return (
        <div>
            <label htmlFor="year-select">Select Course Duration:</label>
            <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                <option value={4}>4 Years</option>
                <option value={5}>5 Years</option>
            </select>
        </div>
    );
};

export default YearSelector;