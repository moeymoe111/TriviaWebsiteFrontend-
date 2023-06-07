import React, { useState, useEffect } from "react";
import styles from "../styles/loginsignup.module.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGooglePlusG, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import Image from "next/image";
import axios from 'axios';
import { useRouter } from 'next/router';
import jwtDecode from 'jwt-decode';
import { BsFillPersonFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { AiFillLock } from "react-icons/ai";
const LoginSignup = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionExpiration = sessionStorage.getItem("sessionExpiration");
    const currentTime = new Date().getTime();

    // Check if the "Remember Me" checkbox should be checked
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const shouldRemember = storedEmail && storedPassword;
    setRememberMe(shouldRemember);

    if (shouldRemember) {
      // Populate the input fields with the stored email and password
      setSignInEmail(storedEmail);
      setSignInPassword(storedPassword);
    }

    if (sessionExpiration && currentTime < sessionExpiration) {
      // Session has not expired, user is logged in
      setIsLoggedIn(true);
    } else {
      // Session has expired, log the user out
      logout();
    }
  }, []);

  const handleSignInClick = () => {
    setIsRightPanelActive(false);
    setIsLoggedIn(false); // Reset the login state when switching between panels
  };

  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
    setIsLoggedIn(false); // Reset the login state when switching between panels
  };

  const handleSignInEmailChange = (event) => {
    setSignInEmail(event.target.value);
    setSignInError(""); // Clear the error message when the email field changes
  };

  const handleSignInPasswordChange = (event) => {
    setSignInPassword(event.target.value);
    setSignInError(""); // Clear the error message when the password field changes
  };

  const login = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true); // Show loading effect

      const response = await axios.post('http://localhost:8080/api/v1/auth/authenticate', {
        email: signInEmail,
        password: signInPassword,
      });

      // Handle success
      const { token } = response.data;
      sessionStorage.setItem("token", token);

      setSessionTimeout(); // Set the session expiration
      setIsLoggedIn(true); // Set the login state

      if (rememberMe) {
        // Store email and password in localStorage
        localStorage.setItem("email", signInEmail);
        localStorage.setItem("password", signInPassword);
      } else {
        // Clear email and password from localStorage
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }

      router.push('/'); // Redirect to the home page
    } catch (error) {
      console.error(error);

      // Handle error
      if (error.response && error.response.data && error.response.data.message) {
        setSignInError("Invalid credentials. Please check your email and password.");
      } else {
        console.log('An error occurred.');
      }
    } finally {
      setIsLoading(false); // Hide loading effect
    }
  };

  const logout = () => {
    // Clear the session data and log the user out
    sessionStorage.removeItem("sessionExpiration");
    sessionStorage.removeItem("token"); // Remove the token
    setIsLoggedIn(false);
  };

  const setSessionTimeout = () => {
    const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const sessionExpiration = new Date().getTime() + sessionDuration;

    sessionStorage.setItem("sessionExpiration", sessionExpiration);
    setTimeout(logout, sessionDuration); // Set the timeout to log the user out after the session expires
  };

  const signUp = async (event) => {
    event.preventDefault();

    const userName = event.target[0].value;
    const email = event.target[1].value;
    const password = event.target[2].value;
    const confirmPassword = event.target[3].value;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setEmailError("");
      setUsernameError("");
      return;
    }

    if (userName.length < 4 || !containsTwoLetters(userName)) {
      setUsernameError("Username must be at least 4 characters long and contain at least 2 letters");
      setEmailError("");
      setPasswordError("");
      return;
    }

    if (password.length < 5 || !containsTwoLetters(password)) {
      setPasswordError("Password must be at least 5 characters long and contain at least 2 letters");
      setEmailError("");
      setUsernameError("");
      return;
    }

    try {
      setIsLoading(true); // Show loading effect

      const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
        userName,
        email,
        password,
      });

      // Handle success
      const { token } = response.data;
      sessionStorage.setItem("token", token);

      setSessionTimeout(); // Set the session expiration
      setIsLoggedIn(true); // Set the login state
      router.push('/'); // Redirect to the home page
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("email")) {
          setEmailError(errorMessage);
          setUsernameError("");
          setPasswordError("");
        } else if (errorMessage.includes("username")) {
          setUsernameError(errorMessage);
          setEmailError("");
          setPasswordError("");
        } else {
          setEmailError("");
          setUsernameError("");
          setPasswordError(errorMessage);
        }
      } else {
        console.log('An error occurred.');
      }
    } finally {
      setIsLoading(false); // Hide loading effect
    }
  };

  const containsTwoLetters = (str) => {
    const letterCount = str.replace(/[^a-zA-Z]/g, "").length;
    return letterCount >= 2;
  };

  const isScreenLessThan500 = typeof window !== 'undefined' && window.innerWidth < 500;

  return (
    <div className={styles.body}>
      {!isLoggedIn ? (
        <div className={`${styles.container} ${isRightPanelActive ? styles.rightPanelActive : ''} ${styles.bodyStyle}`}>
          <div className={styles.signUpContainer}>
              <form action="#" className={styles.flexForm} onSubmit={signUp}>
                <h1 className={styles.title}>Create Account</h1>
               
                <div className={styles.inputContainer}>
  <input className={styles.inputField} type="text" placeholder="UserName" />
  <span className={styles.icon}><BsFillPersonFill /></span>
</div>            
               
                {usernameError && <span className={`${styles.errorMessage} ${styles.error}`}>{usernameError}</span>}
                <div className={styles.inputContainer}>
  <input className={styles.inputField} type="email" placeholder="Email" />
  <span className={styles.icon}><MdEmail /></span>
</div>  
                {emailError && <span className={`${styles.errorMessage} ${styles.error}`}>{emailError}</span>}
                <div className={styles.inputContainer}>
  <input className={styles.inputField} type="password" placeholder="Password" />
  <span className={styles.icon}><AiFillLock /></span>
</div>  
                <div className={styles.inputContainer}>
  <input className={styles.inputField} type="password" placeholder="Confirm Password" />
  <span className={styles.icon}><AiFillLock /></span>
</div>  
                {passwordError && <span className={`${styles.errorMessage} ${styles.error}`}>{passwordError}</span>}
                <button className={styles.Signupbtn} type="submit" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Sign Up"}
                </button>

                <button className={styles.GoogleButton}>
                  <Image src="/img/google-logo-9808.png" alt="" width="14" height="14" />Signup with Google
                </button>
              </form>
          </div>
          <div className={styles.signInContainer}>
            <form action="#" className={styles.flexForm} onSubmit={login}>
              <h1 className={styles.title2}>Sign in</h1>
              <div className={styles.socialContainer}>
                {/* <a href="#" className={`${styles.social} ${styles.links}`}><FontAwesomeIcon icon={faGooglePlusG} /></a> */}
              </div>
              <div className={styles.inputContainer}>

              <input
                className={styles.inputField2}
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={handleSignInEmailChange}
                
              />
                <span className={styles.icon}><MdEmail /></span>

              </div>  
              <div className={styles.inputContainer}>

              <input
                className={styles.inputField2}
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={handleSignInPasswordChange}
                
              />
                <span className={styles.icon}><AiFillLock /></span>

                            </div>  

              {signInError && <span className={`${styles.errorMessage} ${styles.error}`}>{signInError}</span>}
              <div className={styles.MiscContainer}>
                <label className={styles.rememberPasswordLabel}>
                  <input
                    type="checkbox"
                    className={styles.rememberPasswordCheckbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Password
                </label>
                <div className={styles.forgotPasswordLink}>
                  <a href="/forgot-password">Forgot password?</a>
                </div>
              </div>
              <button className={styles.btnLogin} type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Sign In"}
              </button>
              <div className={styles.line}></div>
              <button className={styles.GoogleButton2}>
                <Image src="/img/google-logo-9808.png" alt="" width="14" height="14" />Continue with Google
              </button>
            </form>
          </div>
          <div className={styles.overlayContainer}>
              <div className={`${styles.overlay}`}>
                <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                  <div className={styles.logoContainer} >
                    <Image src="/img/imageedit_20_6995547124.png" alt="" width={100} height={50} className={styles.logo} />
                  </div>
                  <h1 className={styles.slidingTitle}>Welcome Back</h1>
                  <p className={styles.normalText}>Use your personal info to login</p>
                  <button className={`${styles.btnGhost} ${styles.btn}`} onClick={handleSignInClick}>Sign In</button>
                </div>
                <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                  <div className={styles.logoContainer2}>
                    <Image src="/img/imageedit_20_6995547124.png" alt="" width={100} height={50} className={styles.logo} />
                  </div>
                  <h1 className={styles.slidingTitle}>Join Today</h1>
                  <p className={styles.normalText}>Click The Signup Button Below To Climb The Ranks</p>
                  <button className={`${styles.btnGhost} ${styles.btn}`} onClick={handleSignUpClick}>Sign Up</button>
                </div>
              </div>
            </div>
          {isScreenLessThan500 && (
            <div className={styles.overlayContainer2}>
              <div className={`${styles.overlay}`}>
                <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                  <div className={styles.logoContainer} >
                    <Image src="/img/imageedit_20_6995547124.png" alt="" width={100} height={50} className={styles.logo} />
                  
                  </div>
                  <div className={styles.btn2Container}>

                  <p className={styles.normalText2}>Already Member? Welcoome Back !</p>
                  <button className={`${styles.btnGhost} ${styles.btn2}`} onClick={handleSignInClick}>Sign In</button>
                </div>
                </div>
                <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                  <div className={styles.logoContainer2}>
                    <Image src="/img/imageedit_20_6995547124.png" alt="" width={100} height={50} className={styles.logo} />
                  </div>
                  
                  <div className={styles.btn2Container}>

                  <p className={styles.normalText2}>Not A memeber? Join today</p>

                  <button className={`${styles.btnGhost} ${styles.btn2}`} onClick={handleSignUpClick}>Sign Up</button>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>You are logged in!</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
