import React from 'react';

// Components
import {
    SignInButton, SignUpButton, SignedIn, SignedOut, UserButton
} from '@clerk/nextjs'

// Styles
import styles from '../../styles/header.module.css';

export const HeaderPanel = () =>
    <div className={styles.header_panel}>
        <div>
        <a href='/'>Logo</a>
        </div>
        <div></div>
        <div className={styles.header_panel_buttons}>
            <SignedOut>
                <a href='sign-in'>Login</a>
                <a href='sign-up'>Register</a>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    </div >;