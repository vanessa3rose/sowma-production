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
      <div className="grid grid-cols-[2fr,2fr,1fr,1fr] items-center text-center font-poppins text-2xl font-normal leading-[48px] text-gray-500 border-b border-gray-300 pb-2">
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Remove</span>
      </div>

      <div className="divide-y divide-gray-300">
        {users.map((user, idx) => (
          <div
            key={`${user.email}-${idx}`}
            className="grid grid-cols-[2fr,2fr,1fr,1fr] items-center text-center font-poppins text-xl leading-[48px] py-3"
          >
            <div className="text-gray-800">{user.name}</div>
            <div className="text-gray-800">{user.email}</div>
            <div className="flex justify-center">
              <select className="border-2 border-[#7B7C7C] rounded-full px-5 py-2 text-gray-800 bg-white min-w-[130px] text-lg">
                <option>Admin</option>
                <option>Instructor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="flex justify-center">
              <button
                aria-label={`Remove ${user.name}`}
                className="px-5 py-2 min-w-[90px] h-12 flex items-center justify-center rounded-full border-2 border-[#FF1313] text-[#FF1313] text-2xl leading-none"
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
