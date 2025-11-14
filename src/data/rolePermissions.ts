export const ROLE_PERMISSIONS = {
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