"use client"

import { Button, MainTable, Notification  } from "@canonical/react-components"
import { getUpfList } from "@/utils/getUpfList";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { UpfItem } from "@/components/types";
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";
import { WebconsoleApiError } from "@/utils/errors";

import Loader from "@/components/Loader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import PageHeader from "@/components/PageHeader"


export default function UpfTable() {
  const auth = useAuth()
  const [showNotification, setShowNotification] = useState(true);

  const query = useQuery<UpfItem[], Error>({
    queryKey: ['upfs', auth.user?.authToken],
    queryFn: () => getUpfList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401") || error.message.includes("403")) {
        return false
      }
      return failureCount < 3
    },
  })
  if (query.status == "pending") { return <Loader text="loading..." /> }
  if (query.status == "error") {
    if (query.error instanceof WebconsoleApiError && query.error.status === 401) {
        auth.logout();
    }
    return (
      <>
        <Notification severity="negative" title="Error">
          Failed to retrieve UPFs.
        </Notification>
      </>
    )
  }
  const upfs = query.data || [];
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