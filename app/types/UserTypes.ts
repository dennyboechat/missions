export type UserId = string;

export interface User {
  userId: UserId;
  userThirdPartyId?: string;
  userName: string;
  userEmail: string;
}
