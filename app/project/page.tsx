// Components
import { Container, Grid, Heading, Link, Button } from "@radix-ui/themes";
import { InputTextField } from "../components/ui/InputTextField";

const ProjectNew = () => (
  <Container>
    <Grid gap='2'>
      <Heading>New project</Heading>

      <InputTextField
        label="Project name"
        placeholder="Africa Help, Fiji Medical"
      />

      <InputTextField label="Project description" placeholder="Bla bla bla" />

      <Button>{"Create"}</Button>
    </Grid>
    <Link href="/dashboard">{"< Dashboard"}</Link>
  </Container>
);

export default ProjectNew;
