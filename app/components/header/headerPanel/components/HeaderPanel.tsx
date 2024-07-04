"use client";

// Components
import { Grid, Link, Button } from "@radix-ui/themes";
import { SignUpDialog } from "../../../auth/signUp";
import { SignInDialog } from "../../../auth/signIn";
import { SignButtons } from "../../signButtons";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

// Hooks
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useProject } from "../../../../lib/ProjectContext";

// Styles
import styles from "../styles/HeaderPanel.module.css";

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

  let breadcrumb = <span />;

  const projectLinks = ["/project-patients/", "project-users", "project"];
  const hasDashboardLink = projectLinks.some((path) =>
    currentPath.includes(path)
  );

  if (hasDashboardLink) {
    breadcrumb = (
      <Button
        variant="outline"
        title="Go back to dashboard"
        onClick={() => {
          router.push("/dashboard");
        }}
      >
        <ChevronLeftIcon height="20" width="20" />
      </Button>
    );
  } else {
    const patientLinks = [
      "patient-personal",
      "patient-dentistry",
      "patient-summary",
    ];
    const hasPatientLink = patientLinks.some((path) =>
      currentPath.includes(path)
    );

    if (hasPatientLink && project) {
      const { projectId } = project;
      breadcrumb = (
        <Button
          variant="outline"
          title="Go back to project"
          onClick={() => {
            router.push(`/project-patients/${projectId}`);
          }}
        >
          <ChevronLeftIcon height="20" width="20" />
        </Button>
      );
    }
  }

  return (
    <>
      <Grid
        columns={{ initial: "80px 1fr auto", sm: "200px 1fr auto" }}
        gap="3"
        align="center"
        height="50px"
      >
        <Link className={styles.header_logo} href={logoLink}>
          Logo
        </Link>
        <div>{breadcrumb}</div>
        <SignButtons onSignInClick={onSignIn} onSignUpClick={onSignUp} />
      </Grid>
      {showSignUp && <SignUpDialog onClose={() => setShowSignUp(false)} />}
      {showSignIn && <SignInDialog onClose={() => setShowSignIn(false)} />}
    </>
  );
};
