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
}: ProjectReportsFilterProps) => (
  <div>
    <Grid gap="10px" columns={{ sm: "2" }}>
      <DateTime
        label="Start date"
        value={startDate}
        onChange={(value) => setStartDate(value)}
        required
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
    <Button onClick={onGenerateReports}>
      {"Generate reports"}
    </Button>
  </div>
);
