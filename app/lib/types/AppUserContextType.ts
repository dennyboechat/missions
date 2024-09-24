// Types
import { AppUser } from "../../types/AppUser";

export interface AppUserContextType {
  appUser?: AppUser;
  setAppUser?: (appUser: AppUser) => void;
}
