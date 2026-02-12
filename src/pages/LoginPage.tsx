import { useState } from "react";
import login from "../assets/login-picture.png";
import { SignIn } from "@clerk/clerk-react";

interface FormStatus {
  type: "idle" | "success" | "error";
  message: string;
}

type Tab = "signin" | "waitlist";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Reset form state when switching tabs
    setEmail("");
    setStatus({ type: "idle", message: "" });
    setIsSubmitting(false);
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = "";

        // Provide user-friendly messages based on status code
        switch (response.status) {
          case 400:
            errorMessage = "Invalid email format";
            break;

          case 409:
            errorMessage = "You're already on the waitlist!";
            break;

          case 429:
            errorMessage = "Too many requests";
            break;

          case 500:
          case 502:
          case 503:
            errorMessage = "Server temporarily unavailable";
            break;

          default:
            errorMessage = "Unable to join waitlist";
        }

        setStatus({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      // Success
      setStatus({
        type: "success",
        message: "You're on the list!",
      });
      setEmail("");
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setStatus({
          type: "error",
          message: "Connection failed",
        });
      } else {
        setStatus({
          type: "error",
          message: "Something went wrong",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row h-screen items-center justify-center bg-white -mr-6">
      {/* LEFT SIDE */}
      <div className="flex flex-col flex-1 w-full justify-center items-center gap-10 h-full pr-6">
        {/* Header */}
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
              <span className="font-bold text-[#4781C2] whitespace-normal">
                SOWMA Analytics Dashboard
              </span>
            </h1>
          </div>

          {/* Content Container */}
          <div className="w-full max-w-md justify-center items-center">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 w-full justify-center items-center">
              <button
                type="button"
                onClick={() => handleTabChange("waitlist")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeTab === "waitlist"
                    ? "bg-sowma-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Join Waitlist
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("signin")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeTab === "signin"
                    ? "bg-sowma-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Sign in
              </button>
            </div>

            {/* Tab Content - Fixed height container for alignment */}
            <div className="min-h-[500px] w-full">
              {activeTab === "waitlist" ? (
                /* WAITLIST FORM */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email:
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="someone@gmail.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sowma-blue focus:border-transparent outline-none transition-all"
                        required
                      />
                      {email && isValidEmail(email) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Message */}
                  {status.message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        status.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-sowma-blue text-white font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? "Joining..." : "Join"}
                  </button>
                </form>
              ) : (
                /* CLERK SIGN IN */
                <div className="flex w-full justify-center items-center">
                  <SignIn
                    appearance={{
                      elements: {
                        rootBox: "max-w-full justify-center items-center",
                        card: "w-full p-8 rounded-2xl shadow-md border border-gray-200",
                        formButtonPrimary: "hover:bg-sowma-blue text-white",
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-full lg:w-1/2 h-full hidden lg:block">
        <img src={login} alt="login" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
