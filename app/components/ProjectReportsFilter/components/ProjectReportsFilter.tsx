"use client";

// Components
import { Button } from "@radix-ui/themes";
import { DateTime } from "../../ui/DateTime";
import { Icon } from "../../ui/Icon";

// Types
import { ProjectReportsFilterProps } from "../types/ProjectReportsFilterProps";

// Styles
import styles from "../styles/ProjectReportsFilter.module.css";

export const ProjectReportsFilter = ({
  startDate,
  setStartDate,
  isStartDateInvalid,
  endDate,
  setEndDate,
  isEndDateInvalid,
  onGenerateReports,
  onDownloadAllData,
}: ProjectReportsFilterProps) => (
  <div className={styles.filter}>
    <div className={styles.date_field}>
      <DateTime
        label="Start date"
        value={startDate}
        onChange={(value) => setStartDate(value)}
        required
        autoFocus
        errorMessage={isStartDateInvalid ? "Invalid" : ""}
      />
    </div>
    <div className={styles.date_field}>
      <DateTime
        label="End date"
        value={endDate}
        onChange={(value) => setEndDate(value)}
        required
        errorMessage={isEndDateInvalid ? "Invalid" : ""}
      />
    </div>
    <div className={styles.actions}>
      <Button onClick={onGenerateReports}>
        <Icon name="reports" size={17} />
        {"Generate reports"}
      </Button>
      <Button variant="outline" onClick={onDownloadAllData}>
        <Icon name="download" size={17} />
        {"Download all data"}
      </Button>
    </div>
  </div>
);
