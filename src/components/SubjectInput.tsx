import React from 'react';

type Subject = { name: string; units: number; score: number };

const SubjectInput: React.FC<{
    onSubjectsChange: (subjects: Subject[]) => void;
    year: number;
    subjects: Subject[];
}> = ({ onSubjectsChange, year, subjects }) => {

    const handleSubjectChange = (index: number, field: keyof Subject, value: string | number) => {
        const updatedSubjects = [...subjects];
        if (field === 'name') {
            updatedSubjects[index].name = value as string;
        } else {
            updatedSubjects[index][field] = Number(value);
        }
        onSubjectsChange(updatedSubjects);
    };

    const addSubject = () => {
        onSubjectsChange([...subjects, { name: '', units: 0, score: 0 }]);
    };

    const removeSubject = (index: number) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        onSubjectsChange(updatedSubjects);
    };

    return (
        <div>
            {/* Header row */}
            <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold', marginBottom: '4px' }}>
                <span style={{ width: '150px' }}>Subject Name</span>
                <span style={{ width: '80px' }}>Units</span>
                <span style={{ width: '80px' }}>Score</span>
                <span style={{ width: '80px' }}></span>
            </div>
            {subjects.map((subject, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <input
                        type="text"
                        placeholder="Subject Name"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        style={{ width: '150px' }}
                    />
                    <select
                        required
                        value={subject.units}
                        onChange={(e) => handleSubjectChange(index, 'units', e.target.value)}
                        style={{ width: '80px' }}
                    >
                        <option value="">Units</option>
                        {[...Array(7).keys()].map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Score"
                        min={0}
                        max={100}
                        required
                        value={subject.score}
                        onChange={(e) => handleSubjectChange(index, 'score', e.target.value)}
                        style={{ width: '80px' }}
                    />
                    <button type="button" onClick={() => removeSubject(index)}>Remove</button>
                </div>
            ))}
            <button type="button" onClick={addSubject}>Add Subject</button>
        </div>
    );
};

export default SubjectInput;