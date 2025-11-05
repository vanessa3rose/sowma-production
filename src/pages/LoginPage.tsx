import LoginPanel from "../components/Login";
import login from "../assets/login.png";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      {/* Row: [gutter (756px)] [ellipse] */}
      <div className="flex">
        {/* Left column = fixed 756px so the ellipse starts exactly at x=756 */}
        <div className="w-[756px]">
          {/* Place the panel with its Figma offsets inside the gutter */}
          <div className="pl-[94px] pt-[121px]">
            <div className="w-[592px] relative z-10">
              <LoginPanel />
            </div>
          </div>
        </div>

        {/* Right column: ellipse block with top offset -73px */}
        <div className="-mt-[73px] pointer-events-none">
          <div
            className="w-[1013px] h-[1128px]"
            style={{
              // exact clip and background per Figma
              clipPath: "ellipse(50% 50% at 50% 50%)",
              WebkitClipPath: "ellipse(50% 50% at 50% 50%)",
              background: `url(${login}) lightgray -222.814px 0px / 135.147% 100% no-repeat`,
            }}
            aria-hidden
          />
        </div>
      </div>
    </main>
  );
}
