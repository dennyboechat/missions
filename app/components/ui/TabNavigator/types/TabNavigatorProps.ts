export interface TabNavigatorProps {
  activeTab?: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}
