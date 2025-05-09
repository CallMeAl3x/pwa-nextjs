import { UserInfo } from "@/components/auth/user-info";
import { currentUser } from "@/lib/auth";

const ServerPage = async () => {
  const user = await currentUser();

  return <UserInfo user={user} label="Server Page" />;
};

export default ServerPage;
