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
  { key: "id_copy", label: "Copy of ID", required: true },
  { key: "academic_results", label: "Academic results / latest school results", required: true },
  { key: "matric_certificate", label: "Matric certificate", required: false },
  { key: "proof_of_payment", label: "Proof of payment", required: false },
  { key: "other", label: "Other supporting documents", required: false },
] as const;
