// Multivariate Dependencies
import { SignUp } from "@clerk/nextjs";

// Styles
import styles from "../../styles/login.module.css";

const SignUpPage = () => (
  <div className={styles.login_form}>
    <SignUp />
  </div>
);

export default SignUpPage;
