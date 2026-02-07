import UserManagement from "../users/UserManagement";

const Requester = () => (
  <UserManagement
    roleFilter="requester"
    title="Requester Management"
    emptyMessage="No requesters found"
    badgeLabel="Requester"
  />
);

export default Requester;
