import UserManagement from "../users/UserManagement";

const ManageDataMember = () => (
  <UserManagement
    roleFilter="datamember"
    title="Data Member Management"
    emptyMessage="No data members found"
    badgeLabel="Data Member"
  />
);

export default ManageDataMember;
