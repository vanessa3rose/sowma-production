export const ROLE_PERMISSIONS :  Record<
"Admin" | "Intern",
Record<string, boolean> // * had to add this so that the compiler knows that every key will be a valid key of the right type
> = {
  Admin: {
    "Browse all pages": true,
    "Change Date Range": true,
    "Export charts": true,
    "Choose metrics on page": true,
    "Tag events/one-off events": false,
    "Invite/Remove viewers": false,
  },
  Intern: {
    "Browse all pages": false,
    "Change Date Range": false,
    "Export charts": false,
    "Choose metrics on page": true,
    "Tag events/one-off events": false,
    "Invite/Remove viewers": false,
  },
};