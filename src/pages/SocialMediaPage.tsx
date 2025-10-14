export default function SocialMediaPage() {
  return (
    <>
      <div className="p-4">
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => window.location.href = '/'}
            style={{
              width: "40px",
              height: "40px",
              position: "absolute",
              top: "151px",
              left: "335px",
              background: "none",
              border: "none",
              cursor: "pointer",
              outline: "none",
              padding: "0"
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{
                width: "40px",
                height: "40px"
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontStyle: "SemiBold",
              fontSize: "40px",
              lineHeight: "44px",
              letterSpacing: "0px",
              verticalAlign: "middle",
              width: "215px",
              height: "44px",
              position: "absolute",
              top: "147px",
              left: "380px",
            }}
          >
            Instagram
          </h1>
          <select
            style={{
              width: "184px",
              height: "46px",
              backgroundColor: "#ffffff",
              border: "1px solid #A1A1A1",
              borderRadius: "10px",
              position: "absolute",
              top: "142px",
              left: "1115px",
              appearance: "none",
              cursor: "pointer",
              paddingLeft: "48px",
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: "18px",
              outline: "none",
            }}
          >
            <option>Date Range</option>
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
            style={{
              width: "30px",
              height: "30px",
              position: "absolute",
              top: "150px",
              left: "1125px",
              pointerEvents: "none",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
            style={{
              width: "15px",
              height: "15px",
              top: "158px",
              left: "1271px",
              position: "absolute",
              pointerEvents: "none",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>

          <button
            style={{
              width: "141px",
              height: "47px",
              backgroundColor: "#ffffff",
              border: "1px solid #A1A1A1",
              borderRadius: "10px",
              position: "absolute",
              top: "141px",
              left: "1323px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
              style={{
                width: "30px",
                height: "30px",
                top: "7px",
                left: "7px",
                position: "absolute",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
              />
            </svg>
            <p
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontStyle: "Bold",
                fontSize: "18px",
                lineHeight: "39.6px",
                letterSpacing: "0px",
                verticalAlign: "middle",
                width: "150px",
                height: "24px",
                position: "absolute",
                top: "4px",
                left: "7px",
              }}
            >
              Export
            </p>
          </button>
        </div>

        <div
          style={{
            width: "200px",
            height: "130px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "220px",
            left: "320px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Followers
          </p>
        </div>

        <div
          style={{
            width: "200px",
            height: "130px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "365px",
            left: "320px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Comments
          </p>
        </div>

        <div
          style={{
            width: "200px",
            height: "130px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "510px",
            left: "320px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Likes
          </p>
        </div>

        <div
          style={{
            width: "200px",
            height: "130px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "655px",
            left: "320px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Shared
          </p>
        </div>

        <div
          style={{
            width: "400px",
            height: "260px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "220px",
            left: "540px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Impressions
          </p>
        </div>

        <div
          style={{
            width: "480px",
            height: "280px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "500px",
            left: "540px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Reach Sources
          </p>
        </div>

        <div
          style={{
            width: "520px",
            height: "260px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "220px",
            left: "960px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Demographics - Gender
          </p>
        </div>

        <div
          style={{
            width: "440px",
            height: "280px",
            backgroundColor: "#ffffff",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            position: "absolute",
            top: "500px",
            left: "1040px",
          }}
        >
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontStyle: "Medium",
              fontSize: "16px",
              color: "#00000",
              margin: "12px 0 0 20px",
              position: "absolute",
            }}
          >
            Days Posted
          </p>
        </div>
      </div>
    </>
  );
}
