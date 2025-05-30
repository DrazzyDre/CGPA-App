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

    // Inline validation helpers
    const getUnitError = (units: number) =>
        units < 0 || units > 6 ? 'Units must be 0-6' : '';
    const getScoreError = (score: number) =>
        score < 0 || score > 100 ? 'Score must be 0-100' : '';

    return (
        <div>
            <div className="subject-header">
                <span style={{ width: '150px' }}>Subject Name</span>

                <span style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                    Units
                    <span
                        tabIndex={0}
                        aria-label="Units help"
                        title="Units must be between 1 and 6"
                        style={{
                            marginLeft: 4,
                            cursor: 'help',
                            color: '#3949ab',
                            fontWeight: 'bold',
                            outline: 'none'
                        }}
                    >
                        &#9432;
                    </span>
                </span>

                                <span style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                    Score
                    <span
                        tabIndex={0}
                        aria-label="Score help"
                        title="Score must be between 0 and 100. Determines grade."
                        style={{
                            marginLeft: 4,
                            cursor: 'help',
                            color: '#3949ab',
                            fontWeight: 'bold',
                            outline: 'none'
                        }}
                    >
                        &#9432;
                    </span>
                </span>

                <span style={{ width: '80px' }}></span>
            </div>
            {subjects.map((subject, index) => (
                <div key={index} className="subject-row">
                    <input
                        type="text"
                        placeholder="Subject Name"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        style={{ width: '150px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}>
                        <select
                            required
                            value={subject.units}
                            onChange={(e) => handleSubjectChange(index, 'units', e.target.value)}
                        >
                            <option value="">Units</option>
                            {[...Array(7).keys()].map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                        {getUnitError(subject.units) && (
                            <span style={{ color: 'red', fontSize: 11 }}>{getUnitError(subject.units)}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}>
                        <input
                            type="number"
                            placeholder="Score"
                            min={0}
                            max={100}
                            required
                            value={subject.score}
                            onChange={(e) => handleSubjectChange(index, 'score', e.target.value)}
                        />
                        {getScoreError(subject.score) && (
                            <span style={{ color: 'red', fontSize: 11 }}>{getScoreError(subject.score)}</span>
                        )}
                    </div>
                    <button type="button" onClick={() => removeSubject(index)}>Remove</button>
                </div>
            ))}
            <button type="button" onClick={addSubject}>Add Subject</button>
        </div>
    );
};

export default SubjectInput;