import React, { useState } from 'react';
import SubjectInput from './SubjectInput';
import YearSelector from './YearSelector';
import { calculateCGPA } from '../utils/calculateCGPA';

type Subject = { name: string; units: number; score: number };
const SEMESTERS = ['First Semester', 'Second Semester'];

const CGPACalculator: React.FC = () => {
    const [years, setYears] = useState<number>(4);
    const [subjectsByYearAndSemester, setSubjectsByYearAndSemester] = useState<Subject[][][]>(
        Array(4).fill(null).map(() => [ [{ name: '', units: 0, score: 0 }], [{ name: '', units: 0, score: 0 }] ])
    );
    const [projectedCGPA, setProjectedCGPA] = useState<{ cgpa: number, totalPoints: number, totalUnits: number } | null>(null);
    const [validationResult, setValidationResult] = useState<string | null>(null);
    const [validated, setValidated] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'validate' | 'cgpa' | null>(null);


    // Update subjects for a specific year and semester
    const handleSubjectsChange = (yearIdx: number, semIdx: number, newSubjects: Subject[]) => {
        const updated = subjectsByYearAndSemester.map((year, yIdx) =>
            yIdx === yearIdx
                ? year.map((sem, sIdx) => (sIdx === semIdx ? newSubjects : sem))
                : year
        );
        setSubjectsByYearAndSemester(updated);
        setValidated(false);
        setValidationResult(null);
        setProjectedCGPA(null);
    };

    // Update years and reset subjects
    const handleYearChange = (yearCount: number) => {
        setYears(yearCount);
        setSubjectsByYearAndSemester(
            Array(yearCount).fill(null).map(() => [ [{ name: '', units: 0, score: 0 }], [{ name: '', units: 0, score: 0 }] ])
        );
        setValidated(false);
        setValidationResult(null);
        setProjectedCGPA(null);
    };

    // Clear all inputs
    const handleClear = () => {
        setSubjectsByYearAndSemester(
            Array(years).fill(null).map(() => [ [{ name: '', units: 0, score: 0 }], [{ name: '', units: 0, score: 0 }] ])
        );
        setValidated(false);
        setValidationResult(null);
        setProjectedCGPA(null);
    };

    // Get Grade
    const getGrade = (score: number): string => {
        if (score >= 70) return 'A';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        if (score >= 45) return 'D';
        if (score >= 40) return 'E';
        return 'F';
    };

    // Validation logic
    const handleValidate = () => {
        let valid = true;
        let summary = '';
        subjectsByYearAndSemester.forEach((semesters, i) => {
            summary += `Year ${i + 1}:\n`;
            semesters.forEach((subjects, sIdx) => {
                summary += `  ${SEMESTERS[sIdx]}:\n`;
                subjects.forEach((sub, j) => {
                    if (!sub.units || sub.units < 1 || sub.units > 6 || sub.score < 0 || sub.score > 100) {
                        valid = false;
                    }
                    const grade = getGrade(sub.score);
                    summary += `    Subject ${j + 1}: ${sub.name || '(No Name)'} | Units: ${sub.units} | Score: ${sub.score}${grade}\n`;
                });
            });
        });
        setValidationResult(valid ? 'Validation successful!\n\n' + summary : 'Validation failed: Please check all units and scores.\n\n' + summary);
        setValidated(valid);
        setModalMode('validate');
        setModalOpen(true);
    };

    // Calculate CGPA

    const calculateProjectedCGPA = () => {
        if (!validated) {
            setValidationResult('Validate Inputs!');
            setModalMode('validate');
            setModalOpen(true);
            return;
        }
        let totalUnits = 0;
        let totalPoints = 0;

        const getGradePoint = (score: number) => {
            if (score >= 70) return 5;
            if (score >= 60) return 4;
            if (score >= 50) return 3;
            if (score >= 45) return 2;
            if (score >= 40) return 1;
            return 0;
        };

        subjectsByYearAndSemester.forEach((semesters) => {
            semesters.forEach((subjects) => {
                subjects.forEach((sub) => {
                    if (sub.units && sub.score >= 0 && sub.score <= 100) {
                        const gradePoint = getGradePoint(sub.score);
                        totalUnits += sub.units;
                        totalPoints += gradePoint * sub.units;
                    }
                });
            });
        });

        const cgpa = calculateCGPA(totalPoints, totalUnits);
        setProjectedCGPA({ cgpa, totalPoints, totalUnits });
        setModalMode('cgpa');
        setModalOpen(true);
    };




    return (
        <div>
            <h1>CGPA Calculator</h1>
            <YearSelector onYearChange={handleYearChange} />
            {[...Array(years)].map((_, yearIdx) => (
                <div key={yearIdx}>
                    <h2>Year {yearIdx + 1}</h2>
                    {SEMESTERS.map((sem, semIdx) => (
                        <div key={semIdx}>
                            <h3>
                                {sem}, Year {yearIdx + 1}
                            </h3>
                            <SubjectInput
                                year={yearIdx + 1}
                                subjects={subjectsByYearAndSemester[yearIdx][semIdx]}
                                onSubjectsChange={(subs) => handleSubjectsChange(yearIdx, semIdx, subs)}
                            />
                        </div>
                    ))}
                </div>
            ))}
            <div style={{ marginTop: 40, display: 'flex', gap: '12px' }}>
                <button onClick={handleValidate}>Validate</button>
                <button onClick={calculateProjectedCGPA}>Calculate CGPA</button>
                <button onClick={handleClear}>Clear Inputs</button>
            </div>
            {/* Modal for results */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    {modalMode === 'validate' && (
                        <pre>{validationResult}</pre>
                    )}
                    {modalMode === 'cgpa' && projectedCGPA !== null && validated && (
                        <div>
                            <div>Total Points (TP): <b>{projectedCGPA.totalPoints}</b></div>
                            <div>Total Units (TU): <b>{projectedCGPA.totalUnits}</b></div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.5em', marginTop: 12 }}>
                                CGPA = {projectedCGPA.cgpa}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// Simple Modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, maxWidth: 600 }}>
                <button style={{ float: 'right' }} onClick={onClose}>Close</button>
                <div style={{ clear: 'both' }}>{children}</div>
            </div>
        </div>
    );
};

export default CGPACalculator;