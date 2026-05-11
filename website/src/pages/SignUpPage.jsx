import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useSignUp } from "@clerk/clerk-react";
import { fetchAuthContext, syncUserProfile } from "../lib/authApi";

function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { signUp, isLoaded, setActive } = useSignUp();
    const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (isAuthLoaded && isSignedIn) {
            navigate("/dashboard");
        }
    }, [isAuthLoaded, isSignedIn, navigate]);

    const handleSubmit = async () => {
        if (!validateInputs()) {
            setErrorMessage("Please correct the form errors before continuing.");
            return;
        }

        if (!isLoaded) {
            setErrorMessage("Authentication is still loading. Please try again.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                unsafeMetadata: {
                    fullName,
                    phone,
                },
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (error) {
            const clerkError = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
            setErrorMessage(clerkError || "Unable to create account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

  /*Functions for validating inputs */
  // Source - https://stackoverflow.com/a/9204568
// Posted by C. Lee, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-05, License - CC BY-SA 4.0

    function validateEmail(emailAddress) {
        var regex = /\S+@\S+\.\S+/;
        return regex.test(emailAddress);
    }

    function validatePhone(phoneNumber) {
        var regex = /^[+]?[\d()\-\s]{7,20}$/;
        return regex.test(phoneNumber);
    }

    function validateName(name) {
        var regex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
        return regex.test(name);
    }

    const clearAllErrors = () => {
        ["name-error", "email-error", "phone-error", "password-mismatch"].forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add("hidden");
            }
        });
    };

    const showError = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove("hidden");
        }
    };

    const handleVerificationSubmit = async () => {
        if (!verificationCode) {
            setErrorMessage("Enter the verification code sent to your email.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                const syncResponse = await syncUserProfile(getToken, {
                    fullName,
                    email,
                    phone,
                });

                if (!syncResponse.ok) {
                    const syncError = await syncResponse.json().catch(() => ({}));
                    throw new Error(syncError.error || "Unable to save your profile.");
                }

                await fetchAuthContext(getToken);
                navigate("/dashboard");
                return;
            }

            setErrorMessage("Verification is not complete yet. Please try again.");
        } catch (error) {
            const clerkError = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
            setErrorMessage(clerkError || "Unable to verify your email code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateInputs = () => {
        clearAllErrors();

        if (!validateName(fullName)) {
            showError("name-error");
            return false;
        }

        if (!validateEmail(email)) {
            showError("email-error");
            return false;
        }

        if (!validatePhone(phone)) {
            showError("phone-error");
            return false;
        }

        if (password !== confirmPassword) {
            showError("password-mismatch");
            return false;
        }

        if (!password || password.length < 8) {
            setErrorMessage("Password must be at least 8 characters.");
            return false;
        }

        return true;
    };

    return (
        <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
        {/* TopNavBar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-40 -left-20 w-96 h-96 bg-[#d3e4ff]/30 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#acf4a4]/20 rounded-full blur-[120px] -z-10" />

            {/* Editorial Header */}
            <div className="max-w-md w-full mb-10 md:-ml-16">
            <h1 className="text-[#003461] font-extrabold text-5xl md:text-6xl tracking-tight leading-tight mb-4">
                Protect <br />Yourself.
            </h1>
            <p className="text-[#424750] text-lg leading-relaxed max-w-sm">
                Set up your secure protection account in minutes. We'll guide you through each step of the journey.
            </p>
            </div>

            {/* Register Card */}
            <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-[#c2c6d1]/20">
            <div className="space-y-8">
                <div className="space-y-6">

                {/* Full Name Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="full_name">
                    Full Name
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full legal name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    />
                    <div id="name-error" className="hidden text-sm text-[#424750]/80 mt-1">
                        <p>Invalid name. Please enter a valid full name.</p>
                    </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="email">
                    Email Address
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <div id="email-error" className="hidden text-sm text-[#424750]/80 mt-1">
                        <p>Please enter a valid email address.</p>
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="phone">
                    Create Password
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="confirm_password">
                    Confirm Password
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div id="password-mismatch" className="hidden text-sm text-[#424750]/80 mt-1">
                    <p> Password's don't match</p>
                    </div>
                </div>


                {/* Phone Input */}
                <div className="space-y-2">
                    <label className="text-[#191b22] font-bold text-lg block" htmlFor="phone">
                    Phone Number
                    </label>
                    <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {/* Continue Button */}
                {!pendingVerification ? (
                    <>
                        <button
                            className="w-full h-14 bg-gradient-to-br from-[#003461] to-[#004b87] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            disabled={isSubmitting || !fullName || !email || !phone || !password || !confirmPassword}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? "Creating..." : "Continue"}
                            <span className="text-lg">→</span>
                        </button>
                        {errorMessage ? (
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        ) : null}
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-[#191b22] font-bold text-lg block" htmlFor="verification_code">
                                Email Verification Code
                            </label>
                            <input
                                className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                                id="verification_code"
                                name="verification_code"
                                placeholder="Enter code from your email"
                                type="text"
                                value={verificationCode}
                                onChange={(event) => setVerificationCode(event.target.value)}
                            />
                        </div>
                        <button
                            className="w-full h-14 bg-gradient-to-br from-[#003461] to-[#004b87] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            disabled={isSubmitting || !verificationCode}
                            onClick={handleVerificationSubmit}
                        >
                            {isSubmitting ? "Verifying..." : "Verify Email"}
                        </button>
                        {errorMessage ? (
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        ) : null}
                    </>
                )}
                </div>
                <div id="phone-error" className="hidden text-sm text-[#424750]/80 mt-1">
                    <p>Please enter a valid phone number.</p>
                </div>

                <div className="pt-4 text-center">
                <p className="text-[#424750] mb-4">Already have an account?</p>
                <Link
                    className="inline-flex items-center justify-center w-full h-14 bg-[#e7e7f1] text-[#191b22] font-bold text-lg rounded-lg hover:bg-[#e1e2ec] transition-colors"
                    to="/login"
                >
                    Sign In
                </Link>
                </div>
            </div>
            </div>
        </main>

        {/* Footer */}
        <Footer />
        </div>
    );
    }

export default RegisterPage; 
