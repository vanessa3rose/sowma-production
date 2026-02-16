import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";
import { mockUsers } from "./mockUsers.ts";

export default function Waitlist() {
  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      <div className="flex items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-1/2">Email</div>
        <div className="w-1/4 lg:w-1/6">Role</div>
        <div className="w-1/4 lg:w-1/3" />
      </div>

      <div className="divide-y divide-gray-300">
        {mockUsers.map(
          (user: {
            id: Key | null | undefined;
            email:
              | string
              | number
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | null
              | undefined;
            role:
              | string
              | number
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | null
              | undefined;
          }) => (
            <div
              key={user.id}
              className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
            >
              {/* Email */}
              <div className="flex w-1/2 lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 text-gray-800">
                <div>
                  {typeof user.email === "string"
                    ? user.email.split("@")[0]
                    : ""}
                </div>
                <div>{`@${typeof user.email === "string" ? user.email.split("@")[1] : ""}`}</div>
              </div>

              <div className="flex justify-center items-center w-1/4 lg:w-1/6 text-center">
                {user.role}
              </div>

              <div className="w-1/4 lg:w-1/3 px-1 lg:px-4 flex gap-2 lg:gap-4 lg:flex-row flex-col">
                <button
                  className="flex flex-1 justify-center items-center rounded-full bg-[#4e8bcc] text-white py-1 lg:py-2 px-6 lg:px-8 text-sm md:text-base lg:text-lg"
                  onClick={() => console.log(user.email, "Approved")}
                >
                  Approve
                </button>
                <button
                  className="flex flex-1 justify-center items-center rounded-full bg-[#ad3a3b] text-white py-1 lg:py-2 px-6 lg:px-8 text-sm md:text-base lg:text-lg"
                  onClick={() => console.log(user.email, "Denied")}
                >
                  Deny
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
