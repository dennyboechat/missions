export interface ToothButtonProps {
  id: string;
  top: string;
  left: string;
  isSelected?: boolean;
  onClickTooth: (id: string) => void;
}
