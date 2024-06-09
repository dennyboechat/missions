// Multivariate Dependencies
import { SignIn } from "@clerk/nextjs";

// Styles
import styles from "../../styles/login.module.css";

const SignInPage = () => (
  <div className={styles.login_form}>
    <SignIn />
  </div>
);

export default SignInPage;
