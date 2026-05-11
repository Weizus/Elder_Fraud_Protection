import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, expect, test, vi } from "vitest";
import LoginPage from "../pages/LoginPage";

const navigateMock = vi.fn();
const signInCreateMock = vi.fn();
const setActiveMock = vi.fn();
const getTokenMock = vi.fn();
const fetchAuthContextMock = vi.fn();
const syncUserProfileMock = vi.fn();
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
  syncUserProfile: (...args) => syncUserProfileMock(...args),
}));

vi.mock("@clerk/clerk-react", () => ({
  useSignIn: () => ({
    signIn: { create: (...args) => signInCreateMock(...args) },
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
  signInCreateMock.mockReset();
  setActiveMock.mockReset();
  getTokenMock.mockReset();
  fetchAuthContextMock.mockReset();
  syncUserProfileMock.mockReset();
  isAuthLoadedMock = true;
  isSignedInMock = false;
});

test("renders login page", () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );

  expect(screen.getByRole("button", { name: "Sign In" })).toBeTruthy();
  expect(screen.getByLabelText("Email Address")).toBeTruthy();
  expect(screen.getByLabelText("Password")).toBeTruthy();
});

test("submits successful sign in and ensures the user exists in MongoDB", async () => {
  signInCreateMock.mockResolvedValue({
    status: "complete",
    createdSessionId: "sess_123",
  });
  setActiveMock.mockResolvedValue(undefined);
  syncUserProfileMock.mockResolvedValue({ ok: true });
  fetchAuthContextMock.mockResolvedValue({ ok: true });
  getTokenMock.mockResolvedValue("fake_token");

  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );

  fireEvent.change(screen.getByLabelText("Email Address"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Password123!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

  await waitFor(() => {
    expect(signInCreateMock).toHaveBeenCalledWith({
      identifier: "person@example.com",
      password: "Password123!",
    });
  });

  expect(setActiveMock).toHaveBeenCalledWith({ session: "sess_123" });
  expect(syncUserProfileMock).toHaveBeenCalledWith(expect.any(Function), {
    email: "person@example.com",
  });
  expect(fetchAuthContextMock).toHaveBeenCalledWith(expect.any(Function));
  expect(navigateMock).toHaveBeenCalledWith("/dashboard");
});

test("shows clerk error when sign in fails", async () => {
  signInCreateMock.mockRejectedValue({
    errors: [{ message: "Invalid credentials" }],
  });

  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );

  fireEvent.change(screen.getByLabelText("Email Address"), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "wrong-pass" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

  expect(await screen.findByText("Invalid credentials")).toBeTruthy();
});

test("redirects to dashboard when already signed in", async () => {
  isAuthLoadedMock = true;
  isSignedInMock = true;

  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});
