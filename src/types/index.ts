export interface Subject {
    name: string;
    units: number;
}

export interface CGPAInput {
    subjects: Subject[];
    totalUnits: number;
    courseDuration: 4 | 5; // 4 or 5 years
}