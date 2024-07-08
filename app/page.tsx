"use client";

// Components
import { Box, Grid, Container, Heading, Button } from "@radix-ui/themes";
import Image from "next/image";

// Hooks
import { useRouter } from "next/navigation";

// Images
import heroImage from "../public/image/hero_image.webp";

// Styles
import styles from "./styles/main.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <Box>
      <Container>
        <Grid
          columns={{ initial: "1", sm: "2" }}
          gap="20px"
          align="center"
          justify="center"
          className={styles.hero_section}
        >
          <Grid gap="20px">
            <Heading size="8">{"Empowering health at communities"}</Heading>
            <Heading as="h2" size="3">
              {"Our mission to enhance well-being through innovative solutions"}
            </Heading>
            <Grid
              columns={{ initial: "1", sm: "2" }}
              gap="10px"
              width={{ initial: "100%", sm: "300px" }}
              justify={{ initial: "center", sm: "start" }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/sign-up");
                }}
              >
                {"Register"}
              </Button>
              <Button
                onClick={() => {
                  router.push("/sign-in");
                }}
              >
                {"Login"}
              </Button>
            </Grid>
          </Grid>
          <Image
            src={heroImage}
            alt="hero image"
            className={styles.hero_image}
          />
        </Grid>
      </Container>
    </Box>
  );
}
