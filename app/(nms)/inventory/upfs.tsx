"use client"

import { Button, MainTable, Notification  } from "@canonical/react-components"
import { getUpfList, UpfItem } from "@/utils/getUpfList";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react";

import Loader from "@/components/Loader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import PageHeader from "@/components/PageHeader"


export default function UpfTable() {
  const auth = useAuth()
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(true);

  const query = useQuery<UpfItem[], Error>({
    queryKey: ['upfs', auth.user?.authToken],
    queryFn: () => getUpfList(auth.user?.authToken ?? ""),
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
  const upfs = Array.from(query.data ? query.data : [])
  const tableContent: MainTableRow[] = upfs.map((upf) => {
    return {
      key: upf.hostname,
      columns: [
        { content: upf.hostname },
        { content: upf.port},
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
          To add UPFs to the inventory, integrate your UPF charm with the NMS charm.
          </Notification>
        }
        <PageHeader title={`UPFs (${upfs.length})`}>
          <Button
            hasIcon
            appearance="base"
            onClick={() => { query.refetch() }}
            title="Refresh UPF list"
            >
          <SyncOutlinedIcon style={{ color: "#666" }} />
          </Button>
        </PageHeader>
        <MainTable
            defaultSort='"abcd"'
            defaultSortDirection="ascending"
            headers={[
            { content: "Hostname" },
            { content: "Port" },
            ]}
            rows={tableContent}
        />
    </>
  )
}