"use client";

// Components
import { Grid, Button } from "@radix-ui/themes";
import { DateTime } from "../../ui/DateTime";

// Types
import { ProjectReportsFilterProps } from "../types/ProjectReportsFilterProps";

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
  <div>
    <Grid gap="10px" columns={{ sm: "2" }}>
      <DateTime
        label="Start date"
        value={startDate}
        onChange={(value) => setStartDate(value)}
        required
        autoFocus
        errorMessage={isStartDateInvalid ? 'Invalid' : ''}
      />
      <DateTime
        label="End date"
        value={endDate}
        onChange={(value) => setEndDate(value)}
        required
        errorMessage={isEndDateInvalid ? 'Invalid' : ''}
      />
    </Grid>
    <Grid gap="10px" columns={{ sm: "6" }}>
      <Button onClick={onGenerateReports}>
        {"Generate reports"}
      </Button>
      <Button onClick={onDownloadAllData}>
        {"Download all data"}
      </Button>
    </Grid>
  </div>
);
