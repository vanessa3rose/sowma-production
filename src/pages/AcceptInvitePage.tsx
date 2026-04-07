import login from "../assets/login-picture.png";
import { SignUp, useClerk, useUser } from "@clerk/clerk-react";

export default function AcceptInvitePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Keep invite ticket/query params intact across sign-out.
  const handleSignOutAndContinue = async () => {
    const redirectUrl = window.location.href;
    await signOut({ redirectUrl });
  };

  return (
    <section className="flex flex-col lg:flex-row h-screen items-center justify-center bg-white -mr-6">
      <div className="flex flex-col flex-1 w-full justify-center items-center gap-10 h-full pr-6">
        <div className="w-full gap-10 flex flex-col items-center justify-center py-6">
          <div className="w-full flex flex-col items-center">
            <h1
              className="text-center
                font-poppins
                text-xl sm:text-3xl lg:text-5xl
                leading-normal sm:leading-normal lg:leading-[60px]
                font-medium
                text-black"
            >
              Welcome to the
              <br />
              <span className="font-bold text-sowma-light-blue whitespace-normal">
                SOWMA Analytics Dashboard
              </span>
            </h1>
          </div>

          <div className="w-full max-w-md flex flex-col items-center">
            {!isLoaded ? null : isSignedIn ? (
              // Signing out first avoids Clerk treating the active session as the invite target.
              <div className="w-full rounded-xl border border-gray-200 p-5 bg-white">
                <p className="text-gray-800 text-sm mb-3">
                  You are already signed in. To accept an invitation for a
                  different account, sign out first and reopen the invite link.
                </p>
                <button
                  type="button"
                  onClick={handleSignOutAndContinue}
                  className="w-full px-6 py-3 bg-sowma-light-blue text-white font-medium rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Sign out and continue
                </button>
              </div>
            ) : (
              // Clerk consumes the invitation ticket and shows the password/account setup UI.
              <SignUp
                routing="path"
                path="/accept-invite"
                signInUrl="/login"
                forceRedirectUrl="/homepage"
                fallbackRedirectUrl="/homepage"
              />
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 h-full">
        <img
          src={login}
          alt="login visual"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
