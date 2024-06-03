// Components
import { SignIn } from "@clerk/nextjs";

// Styles
import styles from '../../styles/login.module.css';

export default () => {
    return (
        <div className={styles.login_form}>
            <SignIn />
        </div>
    )
};