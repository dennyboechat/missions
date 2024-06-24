"use client";

// Components
import { Grid, Link } from "@radix-ui/themes";
import { SignUpDialog } from "../../../auth/signUp";
import { SignInDialog } from "../../../auth/signIn";
import { SignButtons } from "../../signButtons";

// Hooks
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Styles
import styles from "../styles/HeaderPanel.module.css";

export const HeaderPanel = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const logoLink = user ? "/dashboard" : "/";

  const onSignIn = () => {
    if (currentPath === "/sign-in" || currentPath === "/sign-up") {
      router.push("/sign-in");
    } else {
      setShowSignIn(true);
    }
  };

  const onSignUp = () => {
    if (currentPath === "/sign-in" || currentPath === "/sign-up") {
      router.push("/sign-up");
    } else {
      setShowSignUp(true);
    }
  };

  return (
    <>
      <Grid columns="auto 1fr auto" gap="3" height="50px" className={styles.header_panel}>
        <Link href={logoLink}>Logo</Link>
        <div></div>
        <SignButtons onSignInClick={onSignIn} onSignUpClick={onSignUp} />
      </Grid>
      {showSignUp && <SignUpDialog onClose={() => setShowSignUp(false)} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
    </>
  );
};
