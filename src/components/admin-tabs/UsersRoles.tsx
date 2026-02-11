export default function UsersRoles() {
  const users = [
    { name: "Firstname last name", email: "name@email.com" },
    { name: "Firstname last name", email: "name@email.com" },
    { name: "Firstname last name", email: "name@email.com" },
    { name: "Firstname last name", email: "name@email.com" },
    { name: "Firstname last name", email: "name@email.com" },
    { name: "Firstname last name", email: "name@email.com" },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-[2fr_2fr_2fr_1fr] items-center text-center font-poppins text-md md:text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <div>Name</div>
        <div>Email</div>
        <div>Role</div>
        <div>Remove</div>
      </div>

      <div className="divide-y divide-gray-300">
        {users.map((user, idx) => (
          <div
            key={`${user.email}-${idx}`}
            className="grid grid-cols-[2fr_2fr_2fr_1fr] w-full items-center text-center font-poppins text-xs md:text-lg leading-[48px] py-3"
          >
            <div className="text-wrap text-gray-800">{user.name}</div>
            <div className="text-gray-800">{user.email}</div>
            <div className="flex justify-center">
              <select className="px-1 py-2 mx-1 w-full max-w-[130px] inline-block items-center text-center justify-center rounded-full border-2 border-[#7B7C7C] text-xs md:text-lg leading-none">
                <option>Admin</option>
                <option>Instructor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="flex justify-center">
              <button
                aria-label={`Remove ${user.name}`}
                className="px-1 py-2 mx-1 w-full max-w-[130px] inline-flex items-center justify-center rounded-full border-2 border-[#FF1313] text-[#FF1313] text-2xl leading-none"
                onClick={() =>
                  console.log(`Remove button clicked for ${user.name} (${user.email})`)
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