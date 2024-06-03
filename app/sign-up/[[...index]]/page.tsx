// Components
import { SignUp } from "@clerk/nextjs";

// Styles
import styles from '../../styles/login.module.css';

export default () => {
    return (
        <div className={styles.login_form}>
            <SignUp />
        </div>
    )
};