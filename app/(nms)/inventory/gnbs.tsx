"use client"

import { Button, MainTable, Notification } from "@canonical/react-components"
import { getGnbList, GnbItem } from "@/utils/getGnbList";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react";

import Loader from "@/components/Loader"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";

export default function GnbTable() {
  const auth = useAuth()
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(true);

  const query = useQuery<GnbItem[], Error>({
    queryKey: ['gnbs', auth.user?.authToken],
    queryFn: () => getGnbList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401") || error.message.includes("403")) {
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
    if (query.error.message.includes("403")) {
      router.push("/")
    }
    return <p>{query.error.message}</p>
  }
  const gnbs = Array.from(query.data ? query.data : [])
  const tableContent: MainTableRow[] = gnbs.map((gnb) => {
    return {
      key: gnb.name,
      columns: [
        { content: gnb.name },
        { content: gnb.tac},
      ]
    };
  });

  return (
    <>
      { showNotification && <Notification
          severity="information"
          title="Table automatically populated by the NMS charm"
          onDismiss={() => setShowNotification(false)}
          >
          To add gNodeBs to the inventory, integrate your gNodeB charm with the NMS charm.
        </Notification>
      }
      <PageHeader title={`gNodeBs (${gnbs.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { query.refetch() }}
          title="refresh accounts list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
      </PageHeader>
      <MainTable
        defaultSort='"abcd"'
        defaultSortDirection="ascending"
        headers={[
          { content: "Name" },
          { content: "TAC" },
        ]}
        rows={tableContent}
      />
    </>
  )
}