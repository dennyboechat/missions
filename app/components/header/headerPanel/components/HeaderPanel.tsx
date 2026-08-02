"use client";

// Components
import { Grid, Box, Button } from "@radix-ui/themes";
import Link from "next/link";
import { SignUpDialog } from "../../../auth/signUp";
import { SignInDialog } from "../../../auth/signIn";
import { SignButtons } from "../../signButtons";
import Image from "next/image";
import { Icon } from "../../../ui/Icon";

// Hooks
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useProject } from "../../../../lib/ProjectContext";

// Styles
import styles from "../styles/HeaderPanel.module.css";

// Images
import logoImage from "../../../../../public/image/logo.jpg";

export const HeaderPanel = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { user } = useUser();
  const { project } = useProject();
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

  let backButton = <span />;

  const projectLinks = [
    "/project-patients/",
    "/project-users/",
    "/project/",
    "/project-reports/",
  ];
  const hasDashboardLink = projectLinks.some((path) =>
    currentPath.includes(path)
  );

  if (hasDashboardLink) {
    backButton = (
      <Button
        variant="outline"
        size="1"
        title="Go back to dashboard"
        onClick={() => {
          router.push("/dashboard");
        }}
      >
        <Icon name="back" />
        {"Back"}
      </Button>
    );
  } else {
    const patientLinks = [
      "/patient-personal/",
      "/patient-general/",
      "/patient-dentistry/",
      "/patient-summary/",
      "/project-patient/",
    ];
    const hasPatientLink = patientLinks.some((path) =>
      currentPath.includes(path)
    );

    if (hasPatientLink && project) {
      const { projectId } = project;
      backButton = (
        <Button
          variant="outline"
          size="1"
          title="Go back to patients"
          onClick={() => {
            router.push(`/project-patients/${projectId}`);
          }}
        >
          <Icon name="back" />
          {"Back"}
        </Button>
      );
    } else {
      const projectUserLinks = ["/project-user/"];

      const hasProjectUserLink = projectUserLinks.some((path) =>
        currentPath.includes(path)
      );

      if (hasProjectUserLink && project) {
        const { projectId } = project;
        backButton = (
          <Button
            variant="outline"
            title="Go back to users"
            onClick={() => {
              router.push(`/project-users/${projectId}`);
            }}
          >
            <Icon name="back" />
            {"Back"}
          </Button>
        );
      }
    }
  }

  return (
    <>
      <Grid
        columns={{
          initial: "auto 1fr auto",
          sm: "var(--sidebar-width) 1fr auto",
        }}
        gap="3"
        align="center"
        height="var(--header-height)"
        className={styles.header}
      >
        <Link className={styles.header_logo_link} href={logoLink}>
          <Image src={logoImage} alt="logo" className={styles.header_logo} />
        </Link>
        <Box>{backButton}</Box>
        <SignButtons onSignInClick={onSignIn} onSignUpClick={onSignUp} />
      </Grid>
      {showSignUp && <SignUpDialog onClose={() => setShowSignUp(false)} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
    </>
  );
};
