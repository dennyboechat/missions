export type MedicationUid = string;

export type Drug = string;

export type Dose = string;

export type Instructions = string;

export interface Medication {
  rowId: string;
  medicationUid?: MedicationUid;
  drug?: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}
