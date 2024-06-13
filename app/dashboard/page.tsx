// Components
import { Container, Grid } from "@radix-ui/themes";
import { ProjectCardButton } from "../components/ui/ProjectCardButton";

const DashboardPage = () => (
  <Container>
    <Grid columns={{ xs: '1', sm: "3", md: "3", lg: "5" }} gap="3">
      <ProjectCardButton isAddNew />
      <ProjectCardButton
        projectName="Project Name"
        projectDescription="Project Description here"
      />
    </Grid>
  </Container>
);

export default DashboardPage;
