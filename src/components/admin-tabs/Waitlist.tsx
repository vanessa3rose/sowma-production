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
    <div className="p-6">
      <div className="flex w-full gap-4 mb-3 text-xs md:text-lg font-bold">
        <div className="w-1/2">Email:</div>
        <div className="w-1/6">Role:</div>
        <div className="w-1/3"></div>
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
              className="flex w-full mb-3 text-xs md:text-lg items-start text-left"
            >
              <div className="w-1/2">{user.email}</div>
              <div className="w-1/6">{user.role}</div>

              <div className="w-1/3 flex gap-4 sm:flex-row flex-col">
                <button
                  className="rounded-full bg-[#4e8bcc] px-6 py-2 text-white"
                  onClick={() => console.log(user.email, "Approved")}
                >
                  Approve
                </button>
                <button
                  className="rounded-full bg-[#ad3a3b] px-6 py-2 text-white"
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
