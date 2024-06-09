"use client";

// Components
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Grid, Button } from "@radix-ui/themes";

// Types
import { SignButtonsProps } from "../types/SignButtonsProps";

export const SignButtons = ({
  onSignInClick,
  onSignUpClick,
}: SignButtonsProps) => (
  <Grid columns="auto auto" gap="2">
    <SignedOut>
      <Button onClick={onSignUpClick} variant="outline">
        Register
      </Button>
      <Button onClick={onSignInClick}>Login</Button>
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </Grid>
);
