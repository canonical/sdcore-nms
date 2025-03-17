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

import ErrorNotification from "@/components/ErrorNotification";
import Loader from "@/components/Loader"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { EditGnbModal } from "./gnbs_modals";

const EDIT = "edit" as const;

type modalData = {
  gnb: GnbItem
  action: typeof EDIT;
}

export default function GnbTable() {
  const [modalData, setModalData] = useState<modalData | null>(null);
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
    return (<><ErrorNotification error={"Failed to retrieve gNodeBs."} /></>)
  }
  const gnbs = query.data || [];
  const tableContent: MainTableRow[] = gnbs.map((gnb) => {
    return {
      key: gnb.name,
      columns: [
        { content: gnb.name },
        { content: gnb.tac || "" },
        {
          content:
          <div>
            <Button
              appearance=""
              className="u-no-margin--bottom"
              onClick={() => {
                setModalData({
                  gnb: gnb,
                  action: EDIT,
                });
              }}
              title="Edit"
            >
              Edit
            </Button>
          </div>,
          className:"u-align--right",
        },
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
          To add gNodeBs to the inventory, integrate your gNodeB charm with the NMS charm. For more details, see the
          <a
            href="https://canonical-charmed-aether-sd-core.readthedocs-hosted.com/en/latest/how-to/add_inventory/"
            target="_blank"
          > documentation
          </a>.
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
          {
            content: "Actions",
            className:"u-align--right",
          },
        ]}
        rows={tableContent}
      />
      {modalData?.action == EDIT && <EditGnbModal gnb={modalData.gnb} closeFn={() => setModalData(null)} />}
    </>
  )
}