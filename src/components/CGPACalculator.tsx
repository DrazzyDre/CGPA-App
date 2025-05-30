// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import SubjectInput from './SubjectInput';
import YearSelector from './YearSelector';
import { calculateCGPA } from '../utils/calculateCGPA';


// Toast component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    // Auto-close after 3 seconds
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                background: type === 'success' ? '#43a047' : '#e53935',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 2000,
                fontWeight: 500,
                fontSize: 16,
            }}
        >
            {message}
        </div>
    );
};

type Subject = { name: string; units: number; score: number };
const SEMESTERS = ['First Semester', 'Second Semester'];



const CGPACalculator: React.FC = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [years, setYears] = useState<number>(4);
    const [subjectsByYearAndSemester, setSubjectsByYearAndSemester] = useState<Subject[][][]>(
        Array(4).fill(null).map(() => [ [{ name: '', units: 0, score: 0 }], [{ name: '', units: 0, score: 0 }] ])
    );
    const [projectedCGPA, setProjectedCGPA] = useState<{ cgpa: number, totalPoints: number, totalUnits: number } | null>(null);
    const [validationResult, setValidationResult] = useState<string | null>(null);
    const [validated, setValidated] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'validate' | 'cgpa' | null>(null);
    const [currentYearIdx, setCurrentYearIdx] = useState(0);
    const [currentSemIdx, setCurrentSemIdx] = useState(0);



    const getGradePoint = (score: number) => {
    if (score >= 70) return 5;
    if (score >= 60) return 4;
    if (score >= 50) return 3;
    if (score >= 45) return 2;
    if (score >= 40) return 1;
    return 0;
    };

    const getSemesterGPA = (subjects: Subject[]) => {
        let totalUnits = 0;
        let totalPoints = 0;
        subjects.forEach(sub => {
            if (sub.units && sub.score >= 0 && sub.score <= 100) {
                const gradePoint = getGradePoint(sub.score);
                totalUnits += sub.units;
                totalPoints += gradePoint * sub.units;
            }
        });
        return totalUnits ? (totalPoints / totalUnits).toFixed(2) : '0.00';
    };

    const getYearCGPA = (yearIdx: number) => {
        let totalUnits = 0;
        let totalPoints = 0;
        for (let y = 0; y <= yearIdx; y++) {
            subjectsByYearAndSemester[y].forEach(semester => {
                semester.forEach(sub => {
                    if (sub.units && sub.score >= 0 && sub.score <= 100) {
                        const gradePoint = getGradePoint(sub.score);
                        totalUnits += sub.units;
                        totalPoints += gradePoint * sub.units;
                    }
                });
            });
        }
        return totalUnits ? (totalPoints / totalUnits).toFixed(2) : '0.00';
    };


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
        if (
        window.confirm(
            "Are you sure you want to clear all inputs? This action cannot be undone."
        )
    ) 
    {
        setSubjectsByYearAndSemester(
            Array(years)
                .fill(null)
                .map(() => [
                    [{ name: "", units: 0, score: 0 }],
                    [{ name: "", units: 0, score: 0 }],
                ])
        );

        setValidated(false);
        setValidationResult(null);
        setProjectedCGPA(null);
        setToast({ message: "All inputs cleared.", type: "success" });
    }
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
        if (valid) {
            setToast({ message: 'Validation successful!', type: 'success' });
        } else {
            setToast({ message: 'Validation failed. Please check your inputs.', type: 'error' });
        }
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
        setToast({ message: 'CGPA calculated successfully!', type: 'success' });
        setToast({ message: 'Please validate your inputs first!', type: 'error' });
        setProjectedCGPA({ cgpa, totalPoints, totalUnits });
        setModalMode('cgpa');
        setModalOpen(true);
    };




    return (
        <div className="calculator-container">
            <h1>CGPA Calculator</h1>
            <YearSelector onYearChange={handleYearChange} />
            <div>
                <h2 className="year-heading">Year {currentYearIdx + 1}</h2>


                {/* Progress Indicator */}
                <div style={{ margin: '12px 0', color: '#3949ab', fontWeight: 500 }}>
                    Semester {currentYearIdx * 2 + currentSemIdx + 1} of {years * 2}
                </div>
                <div>
                    <h3 className="semester-heading">
                        {SEMESTERS[currentSemIdx]}, Year {currentYearIdx + 1}
                    </h3>
                    <SubjectInput
                        year={currentYearIdx + 1}
                        subjects={subjectsByYearAndSemester[currentYearIdx][currentSemIdx]}
                        onSubjectsChange={(subs) => handleSubjectsChange(currentYearIdx, currentSemIdx, subs)}
                    />
                    <div style={{ margin: '8px 0 16px 0', color: '#3949ab', fontWeight: 500 }}>
                        GPA: {getSemesterGPA(subjectsByYearAndSemester[currentYearIdx][currentSemIdx])}
                    </div>

                    {/* Navigation Buttons */}

                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <button
                        onClick={() => {
                            if (currentSemIdx > 0) {
                                setCurrentSemIdx(currentSemIdx - 1);
                            } else if (currentYearIdx > 0) {
                                setCurrentYearIdx(currentYearIdx - 1);
                                setCurrentSemIdx(1);
                            }
                        }}
                        disabled={currentYearIdx === 0 && currentSemIdx === 0}
                        style={{
                            opacity: currentYearIdx === 0 && currentSemIdx === 0 ? 0.5 : 1,
                            cursor: currentYearIdx === 0 && currentSemIdx === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => {
                            if (currentSemIdx < 1) {
                                setCurrentSemIdx(currentSemIdx + 1);
                            } else if (currentYearIdx < years - 1) {
                                setCurrentYearIdx(currentYearIdx + 1);
                                setCurrentSemIdx(0);
                            }
                        }}
                        disabled={currentYearIdx === years - 1 && currentSemIdx === 1}
                        style={{
                            opacity: currentYearIdx === years - 1 && currentSemIdx === 1 ? 0.5 : 1,
                            cursor: currentYearIdx === years - 1 && currentSemIdx === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>

                    <div style={{ margin: '8px 0 24px 0', color: '#1a237e', fontWeight: 600 }}>
                        CGPA (up to Year {currentYearIdx + 1}): {getYearCGPA(currentYearIdx)}
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button onClick={handleValidate}>Validate</button>            
                <button
                    onClick={calculateProjectedCGPA}
                    disabled={!validated}
                    style={{ opacity: validated ? 1 : 0.5, cursor: validated ? 'pointer' : 'not-allowed' }}
                >
                    Calculate CGPA
                </button>
                <button onClick={handleClear}>Clear Inputs</button>
            </div>
            {/* Modal for results */}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    <div id="printable-result">
                        {modalMode === 'validate' && (
                            <pre style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px" }}>
                                {validationResult}
                            </pre>
                        )}
                        {modalMode === 'cgpa' && projectedCGPA !== null && validated && (
                            <div>
                                <div style={{ marginBottom: 8 }}>
                                    Total Points (TP): <b>{projectedCGPA.totalPoints}</b>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    Total Units (TU): <b>{projectedCGPA.totalUnits}</b>
                                </div>
                                <div className="cgpa-result">
                                    CGPA = {projectedCGPA.cgpa}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Print/Export Button OUTSIDE printable area */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                background: "#3949ab",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 18px",
                                fontSize: "1em",
                                cursor: "pointer"
                            }}
                        >
                            Print / Export as PDF
                        </button>
                    </div>
                </div>
            </Modal>

            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

// Simple Modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ position: 'relative', paddingTop: 40 }}>
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#e57373',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        fontWeight: 'bold',
                        fontSize: 18,
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ×
                </button>
                <div>{children}</div>
            </div>
        </div>
    );
};
export default CGPACalculator;