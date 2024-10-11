import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div className="relative flex w-full h-screen bg-background">
      <div className="max-w-3xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignUpForm />
      </div>
    </div>
  );
}
