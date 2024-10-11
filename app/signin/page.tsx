import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="relative flex w-full h-screen bg-background">
      <div className="max-w-3xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignInForm />
      </div>
    </div>
  );
}
