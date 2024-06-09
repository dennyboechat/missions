// Multivariate Dependencies
import { SignIn } from '@clerk/nextjs';

// Styles
import styles from '../../styles/login.module.css';

export default () =>
    <div className={styles.login_form}>
        <SignIn />
    </div>