"use client";

// Components
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Grid, Button } from "@radix-ui/themes";

// Types
import { SignButtonsProps } from "../types/SignButtonsProps";

// Styles
import styles from "../styles/SignButtons.module.css";

export const SignButtons = ({
  onSignInClick,
  onSignUpClick,
}: SignButtonsProps) => (
  <Grid columns="auto auto" gap="2" className={styles.sign_buttons}>
    <SignedOut>
      <Button onClick={onSignUpClick} variant="outline" size="1">
        {"Register"}
      </Button>
      <Button onClick={onSignInClick} size="1">
        {"Login"}
      </Button>
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </Grid>
);
