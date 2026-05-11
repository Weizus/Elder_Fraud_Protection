import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import SignUpPage from "../pages/SignUpPage";

const navigateMock = vi.fn();
const signUpCreateMock = vi.fn();
const prepareEmailVerificationMock = vi.fn();
const attemptEmailVerificationMock = vi.fn();
const setActiveMock = vi.fn();
const getTokenMock = vi.fn();
const fetchAuthContextMock = vi.fn();
let isAuthLoadedMock = true;
let isSignedInMock = false;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../lib/authApi", () => ({
  fetchAuthContext: (...args) => fetchAuthContextMock(...args),
}));

vi.mock("@clerk/clerk-react", () => ({
  useSignUp: () => ({
    signUp: {
      create: (...args) => signUpCreateMock(...args),
      prepareEmailAddressVerification: (...args) => prepareEmailVerificationMock(...args),
      attemptEmailAddressVerification: (...args) => attemptEmailVerificationMock(...args),
    },
    isLoaded: true,
    setActive: (...args) => setActiveMock(...args),
  }),
  useAuth: () => ({
    getToken: (...args) => getTokenMock(...args),
    isLoaded: isAuthLoadedMock,
    isSignedIn: isSignedInMock,
  }),
}));

beforeEach(() => {
  navigateMock.mockReset();
  signUpCreateMock.mockReset();
  prepareEmailVerificationMock.mockReset();
  attemptEmailVerificationMock.mockReset();
  setActiveMock.mockReset();
  getTokenMock.mockReset();
  fetchAuthContextMock.mockReset();
  isAuthLoadedMock = true;
  isSignedInMock = false;
});

function fillSignUpForm() {
  fireEvent.change(screen.getByLabelText("Full Name"), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByLabelText("Email Address"), {
    target: { value: "john@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("+1 (555) 000-0000"), {
    target: { value: "+1 (555) 111-2222" },
  });
  fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
    target: { value: "Password123!" },
  });
  fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
    target: { value: "Password123!" },
  });
}

test("renders sign up page without crashing", () => {
  render(
    <BrowserRouter>
      <SignUpPage />
    </BrowserRouter>,
  );
  expect(screen.getByText("Continue")).toBeTruthy();
});

test("submits sign up and requests email verification", async () => {
  signUpCreateMock.mockResolvedValue(undefined);
  prepareEmailVerificationMock.mockResolvedValue(undefined);

  render(
    <BrowserRouter>
      <SignUpPage />
    </BrowserRouter>,
  );

  fillSignUpForm();
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));

  await waitFor(() => {
    expect(signUpCreateMock).toHaveBeenCalledWith({
      emailAddress: "john@example.com",
      password: "Password123!",
      unsafeMetadata: {
        fullName: "John Doe",
        phone: "+1 (555) 111-2222",
      },
    });
  });

  expect(prepareEmailVerificationMock).toHaveBeenCalledWith({ strategy: "email_code" });
  expect(await screen.findByText("Verify Email")).toBeTruthy();
});

test("completes verification and calls backend auth context", async () => {
  signUpCreateMock.mockResolvedValue(undefined);
  prepareEmailVerificationMock.mockResolvedValue(undefined);
  attemptEmailVerificationMock.mockResolvedValue({
    status: "complete",
    createdSessionId: "sess_signup_1",
  });
  setActiveMock.mockResolvedValue(undefined);
  fetchAuthContextMock.mockResolvedValue({ ok: true });

  render(
    <BrowserRouter>
      <SignUpPage />
    </BrowserRouter>,
  );

  fillSignUpForm();
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));

  await screen.findByText("Verify Email");
  fireEvent.change(screen.getByLabelText("Email Verification Code"), {
    target: { value: "123456" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

  await waitFor(() => {
    expect(attemptEmailVerificationMock).toHaveBeenCalledWith({ code: "123456" });
  });
  expect(setActiveMock).toHaveBeenCalledWith({ session: "sess_signup_1" });
  expect(fetchAuthContextMock).toHaveBeenCalledWith(expect.any(Function));
  expect(navigateMock).toHaveBeenCalledWith("/dashboard");
});

test("redirects to dashboard when already signed in", async () => {
  isAuthLoadedMock = true;
  isSignedInMock = true;

  render(
    <BrowserRouter>
      <SignUpPage />
    </BrowserRouter>,
  );

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});