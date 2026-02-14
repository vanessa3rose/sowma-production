export default function UsersRoles() {
  const users = [
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
    { firstName: "Firstname", lastName: "Lastname", email: "name@email.com" },
  ];

  return (
    <div className="lg:px-6 px-2 lg:py-6 py-4">
      <div className="flex items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div className="w-[30%]">Name</div>
        <div className="w-[30%]">Email</div>
        <div className="w-[20%]">Role</div>
        <div className="w-[20%]">Remove</div>
      </div>

      <div className="divide-y divide-gray-300">
        {users.map((user, idx) => (
          <div
            key={`${user.email}-${idx}`}
            className="flex w-full justify-center text-center items-center font-poppins text-xs md:text-lg leading-[48px] py-3"
          >
            {/* Name */}
            <div className="flex lg:flex-row lg:space-x-2 flex-col justify-center items-center leading-4 lg:leading-8 w-[30%] overflow-x-scroll text-gray-800">
              <div>{user.firstName}</div>
              <div>{user.lastName}</div>
            </div>

            {/* Email */}
            <div className="flex lg:flex-row flex-col justify-center items-center leading-4 lg:leading-8 w-[30%] overflow-x-scroll text-gray-800">
              <div>{user.email.split("@")[0]}</div>
              <div>{`@${user.email.split("@")[1]}`}</div>
            </div>

            {/* Role */}
            <div className="flex w-[20%] justify-center">
              <select className="lg:px-6 px-2 py-2 mx-1 inline-block items-center text-center justify-center rounded-full border-2 border-[#7B7C7C] text-xs md:text-lg leading-none">
                <option>Admin</option>
                <option>User</option>
                <option>Viewer</option>
              </select>
            </div>

            {/* Remove */}
            <div className="flex w-[20%] justify-center">
              <button
                aria-label={`Remove ${user.firstName} ${user.lastName}`}
                className="lg:px-6 px-2 py-1.5 mx-1 inline-flex items-center justify-center rounded-full border-2 border-[#FF1313] text-[#FF1313] text-2xl leading-none"
                onClick={() =>
                  console.log(
                    `Remove button clicked for ${user.firstName} ${user.lastName} (${user.email})`,
                  )
                }
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
