"use client"

import { Button, Icon, MainTable, Notification  } from "@canonical/react-components"
import { getUpfList } from "@/utils/upfOperations";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { queryKeys } from "@/utils/queryKeys";
import { UpfItem } from "@/components/types";
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";
import { is401UnauthorizedError } from "@/utils/errors";

import Loader from "@/components/Loader"
import PageHeader from "@/components/PageHeader"
import ErrorNotification from "@/components/ErrorNotification";


export default function UpfTable() {
  const auth = useAuth()
  const [showNotification, setShowNotification] = useState(true);

  const query = useQuery<UpfItem[], Error>({
    queryKey: [ queryKeys.upfs, auth.user?.authToken],
    queryFn: () => getUpfList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })
  if (query.status == "pending") { return <Loader/> }
  if (query.status == "error") {
    if (is401UnauthorizedError(query.error)) {
        auth.logout();
    }
    return (<><ErrorNotification error={"Failed to retrieve UPFs."} /></>)
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
          To add UPFs to the inventory, integrate your UPF charm with the NMS charm. For more details, see the
          <a
            href="https://canonical-charmed-aether-sd-core.readthedocs-hosted.com/en/latest/how-to/add_inventory/"
            target="_blank"
          > documentation
          </a>.
          </Notification>
        }
        <PageHeader title={`UPFs (${upfs.length})`}>
          <Button
            hasIcon
            appearance="base"
            onClick={() => { query.refetch() }}
            title="Refresh UPF list"
            >
          <Icon name="restart" />
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