"use client";

import { Button, ContextualMenu, MainTable } from "@canonical/react-components";
import {
  ChangePasswordModal,
  CreateUserModal,
  DeleteModal,
} from "@/app/(nms)/users/modals";
import { is401UnauthorizedError, is403ForbiddenError } from "@/utils/errors";
import { listUsers } from "@/utils/accountQueries";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useAuth } from "@/utils/auth";
import { useQuery } from "@tanstack/react-query";
import { UserEntry } from "@/components/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ErrorNotification from "@/components/ErrorNotification";
import Loader from "@/components/Loader";
import PageContent from "@/components/PageContent";
import PageHeader from "@/components/PageHeader";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { queryKeys } from "@/utils/queryKeys";

const CREATE_USER = "create user" as const;
const CHANGE_PASSWORD = "change password" as const;
const DELETE = "delete" as const;

type modalData = {
  user: UserEntry;
  type: typeof CREATE_USER | typeof CHANGE_PASSWORD | typeof DELETE;
};

export default function Users() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth();
  const router = useRouter();
  const query = useQuery<UserEntry[], Error>({
    queryKey: [queryKeys.users, auth.user?.authToken],
    queryFn: () =>
      listUsers({ authToken: auth.user ? auth.user.authToken : "" }),
    enabled: auth.user ? true : false,
  });
  if (query.status == "pending") {
    return <Loader />;
  }
  if (query.status == "error") {
    if (is401UnauthorizedError(query.error)) {
      auth.logout();
    }
    if (is403ForbiddenError(query.error)) {
      router.push("/");
    }
    return (
      <>
        <ErrorNotification error={"Failed to retrieve users."} />
      </>
    );
  }
  const users = Array.from(query.data ? query.data : []);
  const tableContent: MainTableRow[] = users.map((user) => {
    return {
      key: user.username,
      columns: [
        { content: user.username },
        {
          content: (
            <ContextualMenu
              links={[
                {
                  children: "Delete account",
                  disabled: user.role == 1,
                  onClick: () => setModalData({ user: user, type: DELETE }),
                },
                {
                  children: "Change password",
                  disabled: user.role == 1,
                  onClick: () =>
                    setModalData({ user: user, type: CHANGE_PASSWORD }),
                },
              ]}
              hasToggleIcon
            />
          ),
          className: "u-align--right",
        },
      ],
    };
  });

  return (
    <>
      <PageHeader title={`NMS Users (${users.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => {
            query.refetch();
          }}
          title="refresh accounts list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button
          appearance="positive"
          onClick={() =>
            setModalData({ user: {} as UserEntry, type: CREATE_USER })
          }
        >
          Create
        </Button>
      </PageHeader>
      <PageContent>
        <MainTable
          defaultSort='"abcd"'
          defaultSortDirection="ascending"
          headers={[
            { content: "Username" },
            { content: "Actions", className: "u-align--right" },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.type == DELETE && (
        <DeleteModal user={modalData.user} closeFn={() => setModalData(null)} />
      )}
      {modalData?.type == CHANGE_PASSWORD && (
        <ChangePasswordModal
          user={modalData.user}
          closeFn={() => setModalData(null)}
        />
      )}
      {modalData?.type == CREATE_USER && (
        <CreateUserModal closeFn={() => setModalData(null)} />
      )}
    </>
  );
}
