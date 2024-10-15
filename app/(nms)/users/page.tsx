"use client"

import { useQuery } from "@tanstack/react-query"
import { listUsers } from "@/utils/queries"
import { UserEntry } from "@/components/types"
import Loader from "@/components/Loader"
import { useAuth } from "@/utils/auth"
import PageHeader from "@/components/PageHeader"
import { Button, ContextualMenu, MainTable, Modal } from "@canonical/react-components"
import PageContent from "@/components/PageContent"
import { useState } from "react"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { ChangePasswordModal, DeleteModal } from "./modals"

type modalData = {
  user: UserEntry
  type: "delete" | "change password"
}

export default function Users() {
  const [modalData, setModalData] = useState<modalData | null>(null);

  const auth = useAuth()
  const query = useQuery<UserEntry[], Error>({
    queryKey: ['users'],
    queryFn: () => listUsers({ authToken: auth.user ? auth.user.authToken : "" }),
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
  const tableContent = users.map((user) => {
    return {
      key: user.id,
      columns: [
        { content: user.username },
        {
          content: (
            <ContextualMenu
              links={[
                {
                  children: "Delete account",
                  disabled: user.id == 1,
                  onClick: () => setModalData({ user: user, type: "delete" })
                }, {
                  children: "Change password",
                  onClick: () => setModalData({ user: user, type: "change password" })
                }
              ]}
              hasToggleIcon
              position={"right"}
            />
          ),
        },
      ],
    };
  });

  return (
    <>
      <PageHeader title={`NMS Accounts (${users.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { query.refetch() }}
          title="refresh accounts list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" >
          Create
        </Button>
      </PageHeader>
      <PageContent>
        <MainTable
          defaultSort='"abcd"'
          defaultSortDirection="ascending"
          headers={[
            { content: "IMSI" },
            { content: "Actions", className: "u-align--right" },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.type == "delete" && <DeleteModal user={modalData.user} closeFn={() => setModalData(null)} />}
      {modalData?.type == "change password" && <ChangePasswordModal user={modalData.user} closeFn={() => setModalData(null)} />}
    </>
  )
}