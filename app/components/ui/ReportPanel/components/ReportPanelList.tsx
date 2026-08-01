"use client";

// Types
import { ReactNode } from "react";

// Styles
import styles from "../styles/ReportPanel.module.css";

export const ReportPanelList = ({ children }: { children: ReactNode }) => (
  <div className={styles.list}>{children}</div>
);
