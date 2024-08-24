export type MedicationUid = string;

export type Drug = string;

export type Dose = string;

export interface Medication {
  uid: MedicationUid;
  drug?: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: string;
}
