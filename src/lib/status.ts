export const APPLICATION_STATUSES = [
  "documents_submitted",
  "under_assessment",
  "institution_identified",
  "application_in_progress",
  "application_submitted",
  "awaiting_response",
  "successful",
  "unsuccessful",
  "additional_documents_required",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  documents_submitted: "Documents Submitted",
  under_assessment: "Under Assessment",
  institution_identified: "Institution Identified",
  application_in_progress: "Application in Progress",
  application_submitted: "Application Submitted",
  awaiting_response: "Awaiting Response",
  successful: "Successful",
  unsuccessful: "Unsuccessful",
  additional_documents_required: "Additional Documents Required",
};

export const DOCUMENT_TYPES = [
  { key: "id_copy", label: "Certified copy of ID / birth certificate", required: true },
  { key: "academic_results", label: "Latest academic results (Grade 11 final / Grade 12)", required: true },
  { key: "matric_certificate", label: "Matric (NSC) certificate", required: false },
  { key: "guardian_id", label: "Parent / guardian ID copy", required: false },
  { key: "proof_of_residence", label: "Proof of residence", required: false },
  { key: "proof_of_income", label: "Proof of household income (for NSFAS)", required: false },
  { key: "proof_of_payment", label: "Proof of payment", required: false },
  { key: "other", label: "Other supporting documents", required: false },
] as const;

export const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

export const COMMON_SUBJECTS = [
  "English Home Language", "English First Additional Language", "Afrikaans Home Language",
  "Afrikaans First Additional Language", "isiZulu Home Language", "isiXhosa Home Language",
  "Sepedi Home Language", "Setswana Home Language", "Sesotho Home Language", "Xitsonga Home Language",
  "Tshivenda Home Language", "siSwati Home Language", "isiNdebele Home Language",
  "Mathematics", "Mathematical Literacy", "Technical Mathematics", "Physical Sciences",
  "Life Sciences", "Geography", "History", "Accounting", "Business Studies", "Economics",
  "Information Technology", "Computer Applications Technology", "Engineering Graphics and Design",
  "Agricultural Sciences", "Tourism", "Consumer Studies", "Life Orientation",
];

export type SubjectMark = { subject: string; mark: number | null };

export function markToLevel(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

/** Standard APS: best six subjects excluding Life Orientation. */
export function calculateAps(subjects: SubjectMark[]): number {
  return subjects
    .filter((s) => s.subject && s.mark != null && !/life orientation/i.test(s.subject))
    .map((s) => markToLevel(Number(s.mark)))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((a, b) => a + b, 0);
}
