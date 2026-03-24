export enum UserRole { 
  PRINCIPAL = 'principal', 
  DEPUTY_PRINCIPAL = 'deputy_principal', 
  HOD = 'hod', 
  CLASS_TEACHER = 'class_teacher', 
  ACCOUNTANT = 'accountant', 
  PARENT = 'parent', 
  NURSE = 'nurse', 
} 

export enum Form { 
  FORM_1 = 'form_1', 
  FORM_2 = 'form_2', 
  FORM_3 = 'form_3', 
  FORM_4 = 'form_4', 
} 

export enum Stream { 
  A = 'A', 
  B = 'B', 
  C = 'C', 
  D = 'D', 
} 

export interface AuthUser { 
  id: string 
  email: string 
  full_name: string 
  role: UserRole 
  assigned_form: Form | null 
  assigned_stream: Stream | null 
  department: string | null 
} 

export interface LoginResponse { 
  access_token: string 
  user: AuthUser 
} 

export interface Student { 
  id: string 
  full_name: string 
  admission_number: string 
  form: Form 
  stream: Stream 
  gender: 'male' | 'female' 
  date_of_birth: string | null 
  parent_id: string | null 
  blood_type: string | null 
  allergies: string[] 
  emergency_contact: string | null 
  is_active: boolean 
  created_at: string 
} 

export interface MedicalCard { 
  id: string 
  student_id: string 
  blood_type: string | null 
  allergies: string[] 
  chronic_conditions: string[] 
  current_medications: string[] 
  emergency_contact_name: string 
  emergency_contact_phone: string 
  emergency_contact_relation: string 
  medical_notes: string | null 
  updated_at: string 
} 

export enum AttendanceStatus { 
  PRESENT = 'PRESENT', 
  ABSENT = 'ABSENT', 
  LATE = 'LATE', 
  EXCUSED = 'EXCUSED', 
} 

export interface Attendance { 
  id: string 
  student: Student 
  recorded_by: string 
  date: string 
  status: AttendanceStatus 
  remarks: string | null 
} 

export interface AttendanceSummary { 
  student: { 
    id: string 
    full_name: string 
    admission_number: string 
    gender: 'male' | 'female' 
  } 
  present: number 
  absent: number 
  late: number 
  excused: number 
  total_days: number 
  attendance_rate: number 
} 

export interface GenderAttendanceSummary { 
  male: { present: number; absent: number; late: number; excused: number; total: number; rate: number } 
  female: { present: number; absent: number; late: number; excused: number; total: number; rate: number } 
}

export enum IncidentType { 
  MISCONDUCT = 'MISCONDUCT', 
  ABSENTEEISM = 'ABSENTEEISM', 
  VIOLENCE = 'VIOLENCE', 
  SUBSTANCE_ABUSE = 'SUBSTANCE_ABUSE', 
  INSUBORDINATION = 'INSUBORDINATION', 
  BULLYING = 'BULLYING', 
  ACADEMIC_DISHONESTY = 'ACADEMIC_DISHONESTY', 
  OTHER = 'OTHER', 
} 

export enum Severity { 
  LOW = 'LOW', 
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH', 
  CRITICAL = 'CRITICAL', 
} 

export enum IncidentStatus { 
  OPEN = 'OPEN', 
  UNDER_REVIEW = 'UNDER_REVIEW', 
  RESOLVED = 'RESOLVED', 
  ESCALATED = 'ESCALATED', 
} 

export interface DisciplineIncident { 
  id: string 
  student: Student 
  reported_by: { id: string; full_name: string } 
  reviewed_by: { id: string; full_name: string } | null 
  incident_type: IncidentType 
  severity: Severity 
  description: string 
  action_taken: string | null 
  status: IncidentStatus 
  incident_date: string 
  resolved_at: string | null 
  created_at: string 
} 

export interface DisciplineScore { 
  id: string 
  student: Student 
  score: number 
  total_incidents: number 
  last_incident_at: string | null 
  updated_at: string 
} 

export enum Term { 
  TERM_1 = 'TERM_1', 
  TERM_2 = 'TERM_2', 
  TERM_3 = 'TERM_3', 
} 

export enum PaymentMethod { 
  MPESA = 'MPESA', 
  CASH = 'CASH', 
  BANK_TRANSFER = 'BANK_TRANSFER', 
} 

export enum PaymentStatus { 
  PENDING = 'PENDING', 
  COMPLETED = 'COMPLETED', 
  FAILED = 'FAILED', 
  REVERSED = 'REVERSED', 
} 

export enum MpesaStatus { 
  INITIATED = 'INITIATED', 
  SUCCESS = 'SUCCESS', 
  FAILED = 'FAILED', 
  TIMEOUT = 'TIMEOUT', 
  CANCELLED = 'CANCELLED', 
} 

export interface FeeStructure { 
  id: string 
  form: Form 
  academic_year: string 
  term: Term 
  total_amount: number 
  is_active: boolean 
} 

export interface FeePayment { 
  id: string 
  student: Student 
  fee_structure: FeeStructure 
  amount: number 
  payment_method: PaymentMethod 
  mpesa_receipt: string | null 
  mpesa_phone: string | null 
  transaction_date: string 
  status: PaymentStatus 
  notes: string | null 
  created_at: string 
} 

export interface FeeBalance { 
  id: string 
  student: Student 
  fee_structure: FeeStructure 
  total_billed: number 
  total_paid: number 
  balance: number 
  last_payment_at: string | null 
} 

export interface FeeBalanceSummary extends FeeBalance {} 

export interface MpesaTransaction { 
  id: string 
  checkout_request_id: string 
  phone_number: string 
  amount: number 
  student: Student | null 
  result_code: string | null 
  result_desc: string | null 
  mpesa_receipt: string | null 
  status: MpesaStatus 
  initiated_at: string 
  completed_at: string | null 
} 

export interface DeficitTrajectory { 
  form: Form 
  term: Term 
  year: string 
  total_billed: number 
  total_collected: number 
  collection_rate: number 
  daily_velocity: number 
  days_elapsed: number 
  days_remaining: number 
  projected_collection: number 
  projected_deficit: number 
  risk_level: 'low' | 'medium' | 'high' 
}
