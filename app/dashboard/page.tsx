// Components
import { Container, Grid, Button } from "@radix-ui/themes";
import { CardButton } from "../components/ui/CardButton";

const DashboardPage = () => (
  <Container>
    <Grid columns={{ initial: "1", md: "3", lg: "5" }} gap="3">
      <CardButton>
        <Button>{"go"}</Button>
      </CardButton>
    </Grid>
  </Container>
);

export default DashboardPage;
