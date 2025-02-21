"use client"

import { Button, MainTable, Notification } from "@canonical/react-components"
import { getGnbList } from "@/utils/gnbOperations";
import { GnbItem } from "@/components/types";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";
import { is401UnauthorizedError }  from "@/utils/errors";

import Loader from "@/components/Loader"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";


export default function GnbTable() {
  const auth = useAuth()
  const [showNotification, setShowNotification] = useState(true);

  const query = useQuery<GnbItem[], Error>({
    queryKey: [ queryKeys.gnbs , auth.user?.authToken],
    queryFn: () => getGnbList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })
  if (query.status == "pending") { return <Loader/> }
  if (query.status == "error") {
    if (is401UnauthorizedError(query.error)) {
      auth.logout();
    }
    return (
      <>
        <Notification severity="negative" title="Error">
          Failed to retrieve gNodeBs.
        </Notification>
      </>
    )
  }
  const gnbs = query.data || [];
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
          title="Refresh gNodeB list"
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