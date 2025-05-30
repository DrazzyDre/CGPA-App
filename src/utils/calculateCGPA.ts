export function calculateCGPA(totalGradePoints: number, totalUnits: number): number {
    if (totalUnits === 0) {
        return 0;
    }
    const cgpa = totalGradePoints / totalUnits;
    return parseFloat(cgpa.toFixed(2));
}

