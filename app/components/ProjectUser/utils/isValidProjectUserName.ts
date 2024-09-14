export const isValidProjectUserName = ({ userName }: { userName?: string }) =>
  userName && userName.trim() !== "";
