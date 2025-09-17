# CGPA Calculation Flow Documentation

## Overview
The CGPA (Cumulative Grade Point Average) is calculated on a **10.0 scale** based on student marks in final exams.

## Database Schema Flow

### 1. **Marks Entry (by Professor)**
```
Professor uploads marks → Grade.marksObtained (out of 100)
```
- **Table**: `Grade`
- **Field**: `marksObtained` (Float)
- **Range**: 0-100
- **Exam Type**: Only `FINAL_EXAM` is considered

### 2. **Database Relationships**
```
Student → ExamResult → Grade → Subject
                ↓
            (credits)
```

**Key Tables:**
- `Grade`: Stores `marksObtained` for each subject
- `ExamResult`: Links student to exam with status
- `Subject`: Contains `credits` for each subject
- `Exam`: Contains `maxMarks` (default: 100)

### 3. **CGPA Calculation Process**

#### Step 1: Fetch Exam Results
```sql
SELECT examResults 
WHERE studentId = ? 
AND status = 'PASS' 
AND exam.type = 'FINAL_EXAM'
```

#### Step 2: Convert Marks to Grade Points (10.0 Scale)
```typescript
function convertPercentageToGradePoint(percentage: number): number {
    if (percentage >= 90) return 10.0;  // A+ (90-100%)
    if (percentage >= 80) return 9.0;   // A  (80-89%)
    if (percentage >= 70) return 8.0;   // B+ (70-79%)
    if (percentage >= 60) return 7.0;   // B  (60-69%)
    if (percentage >= 50) return 6.0;   // C  (50-59%)
    if (percentage >= 40) return 5.0;   // D  (40-49%)
    return 0.0;                         // F  (<40%)
}
```

#### Step 3: Calculate Weighted GPA
```typescript
CGPA = (Sum of (Grade Points × Credits)) / (Total Credits)
```

**Example Calculation:**
```
Subject 1: 85% → 9.0 GP × 4 credits = 36.0
Subject 2: 75% → 8.0 GP × 3 credits = 24.0
Subject 3: 92% → 10.0 GP × 4 credits = 40.0
Total: 100.0 / 11 credits = 9.09 CGPA
```

## API Endpoints

### 1. **Calculate Student CGPA**
```typescript
GET /api/v1/users/{studentId}
// Returns user data with calculated CGPA
```

### 2. **Get Academic Record**
```typescript
GET /api/v1/users/{studentId}/academic-record
// Returns detailed semester-wise GPA and overall CGPA
```

## Grade Scale Mapping

| Percentage | Grade Point | Letter Grade | Description |
|------------|-------------|--------------|-------------|
| 90-100%    | 10.0        | A+           | Outstanding |
| 80-89%     | 9.0         | A            | Excellent   |
| 70-79%     | 8.0         | B+           | Very Good   |
| 60-69%     | 7.0         | B            | Good        |
| 50-59%     | 6.0         | C            | Average     |
| 40-49%     | 5.0         | D            | Below Average |
| <40%       | 0.0         | F            | Fail        |

## Key Features

### ✅ **What's Included:**
- Only `FINAL_EXAM` results are considered
- Only `PASS` status results are included
- Credit-weighted calculation
- 10.0 scale grade points
- Semester-wise GPA calculation
- Overall CGPA calculation

### ❌ **What's Not Included:**
- Internal assessments
- Mid-term exams  
- Assignment marks
- Failed subjects (status ≠ 'PASS')

## Update History

- **Previous**: 4.0 scale (US system)
- **Current**: 10.0 scale (Indian system)
- **Updated**: Grade point conversion thresholds
- **Maintained**: Credit-weighted calculation logic

## Usage in Placements

The calculated CGPA is used for:
- Placement eligibility (`placement.cgpaCriteria`)
- Student filtering for opportunities
- Academic performance tracking

## Example Flow

1. **Professor uploads marks**: Math = 85/100, Physics = 75/100, Chemistry = 92/100
2. **System calculates percentages**: 85%, 75%, 92%
3. **Converts to grade points**: 9.0, 8.0, 10.0
4. **Applies credit weights**: (9.0×4 + 8.0×3 + 10.0×4) = 100.0
5. **Calculates CGPA**: 100.0 ÷ 11 credits = **9.09 CGPA**