"use client"

import { useQuery } from "@tanstack/react-query"
import { listUsers } from "@/utils/accountQueries"
import { UserEntry } from "@/components/types"
import Loader from "@/components/Loader"
import { useAuth } from "@/utils/auth"
import PageHeader from "@/components/PageHeader"
import { Button, ContextualMenu, MainTable, Modal } from "@canonical/react-components"
import PageContent from "@/components/PageContent"
import { useState } from "react"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { ChangePasswordModal, CreateUserModal, DeleteModal } from "./modals"
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"

type modalData = {
  user: UserEntry
  type: "delete" | "change password" | "create user"
}

export default function Users() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const query = useQuery<UserEntry[], Error>({
    queryKey: ['users', auth.user?.authToken],
    queryFn: () => listUsers({ authToken: auth.user ? auth.user.authToken : "" }),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401")) {
        return false
      }
      return true
    },
  })
  if (query.status == "pending") { return <Loader text="loading..." /> }
  if (query.status == "error") {
    if (query.error.message.includes("401")) {
      auth.logout()
    }
    return <p>{query.error.message}</p>
  }
  const users = Array.from(query.data ? query.data : [])
  const tableContent: MainTableRow[] = users.map((user) => {
    return {
      key: user.username,
      columns: [
        { content: user.username },
        {
          content: <ContextualMenu
            links={[
              {
                children: "Delete account",
                disabled: user.role == 1,
                onClick: () => setModalData({ user: user, type: "delete" })
              }, {
                children: "Change password",
                onClick: () => setModalData({ user: user, type: "change password" })
              }
            ]} hasToggleIcon />,
          className: "u-align--right"
        }],
    };
  });

  return (
    <>
      <PageHeader title={`NMS Users (${users.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { query.refetch() }}
          title="refresh accounts list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ user: {} as UserEntry, type: "create user" })}>
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
      {modalData?.type == "delete" && <DeleteModal user={modalData.user} closeFn={() => setModalData(null)} />}
      {modalData?.type == "change password" && <ChangePasswordModal user={modalData.user} closeFn={() => setModalData(null)} />}
      {modalData?.type == "create user" && <CreateUserModal closeFn={() => setModalData(null)} />}
    </>
  )
}