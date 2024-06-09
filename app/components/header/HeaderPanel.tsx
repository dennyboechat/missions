"use client";

// Components
import { Grid, Link } from "@radix-ui/themes";
import { SignUpDialog } from "../auth/signUp";
import { SignInDialog } from "../auth/signIn";
import { SignButtons } from "./signButtons";

// Hooks
import { useState } from "react";

export const HeaderPanel = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <>
      <Grid columns="auto 1fr auto" gap="3" height="30px">
        <Link href="/">Logo</Link>
        <div></div>
        <SignButtons
          onSignInClick={() => setShowSignIn(true)}
          onSignUpClick={() => setShowSignUp(true)}
        />
      </Grid>
      {showSignUp && <SignUpDialog onClose={() => setShowSignUp(false)} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
    </>
  );
};
