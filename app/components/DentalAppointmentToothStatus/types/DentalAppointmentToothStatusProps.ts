export enum DentalAppointmentToothStatusEnum {
  EXTRACTED = "extracted",
  TREATED = "treated",
}

export interface DentalAppointmentToothStatusProps {
  toothStatus?: DentalAppointmentToothStatusEnum;
}
