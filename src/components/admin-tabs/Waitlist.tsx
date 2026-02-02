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
      <div className="grid grid-cols-12 gap-4 mb-3 text-lg font-bold">
        <div className="col-span-6">Email:</div>
        <div className="col-span-3">Role:</div>
        <div className="col-span-3"></div>
      </div>

      <div className="space-y-4">
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
            <div key={user.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 text-lg">{user.email}</div>
              <div className="col-span-3 text-lg">{user.role}</div>

              <div className="col-span-3 flex gap-4">
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
