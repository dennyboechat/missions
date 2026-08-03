"use client";

// Components
import { Box, Grid, Container, Heading, Text, Button } from "@radix-ui/themes";
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
          gap="48px"
          align="center"
          justify="center"
          className={styles.hero_section}
        >
          <Grid gap="20px">
            <Heading className={styles.hero_title}>
              {"Empowering health at communities"}
            </Heading>
            <Text as="p" className={styles.hero_subtitle}>
              {"Our mission to enhance well-being through innovative solutions"}
            </Text>
            <Grid
              columns={{ initial: "1", sm: "2" }}
              gap="12px"
              width={{ initial: "100%", sm: "320px" }}
              justify={{ initial: "center", sm: "start" }}
            >
              <Button
                variant="outline"
                size="3"
                onClick={() => {
                  router.push("/sign-up");
                }}
              >
                {"Register"}
              </Button>
              <Button
                size="3"
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
            alt="Doctors and nurses seeing patients outdoors around a phone showing a medical cross, with a pharmacy, a clinic and an ambulance behind them"
            className={styles.hero_image}
          />
        </Grid>
      </Container>
    </Box>
  );
}
