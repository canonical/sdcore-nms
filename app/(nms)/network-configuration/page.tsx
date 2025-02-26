"use client"

import { Button, List, MainTable, Notification } from "@canonical/react-components"
import { CreateNetworkSliceModal, EditNetworkSliceModal, DeleteNetworkSliceButton } from "@/app/(nms)/network-configuration/modals";
import { GnbItem, NetworkSlice, UpfItem } from "@/components/types";
import { getGnbList } from "@/utils/gnbOperations";
import { getNetworkSlices } from "@/utils/networkSliceOperations";
import { getUpfList } from "@/utils/upfOperations";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { is401UnauthorizedError }  from "@/utils/errors";

import EmptyStatePage from "@/components/EmptyStatePage";
import ErrorNotification from "@/components/ErrorNotification";
import Loader from "@/components/Loader"
import PageContent from "@/components/PageContent"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";


const CREATE = "create" as const;
const EDIT = "edit" as const;

type modalData = {
  networkSlice: NetworkSlice
  action: typeof CREATE | typeof EDIT;
}

export default function NetworkSlices() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const auth = useAuth()

  const networkSliceQuery = useQuery<NetworkSlice[], Error>({
    queryKey: [queryKeys.networkSlices, auth.user?.authToken],
    queryFn: () => getNetworkSlices(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const upfQuery = useQuery<UpfItem[], Error>({
    queryKey: [queryKeys.upfs, auth.user?.authToken],
    queryFn: () => getUpfList(auth.user!.authToken),
    enabled: auth.user ? true : false
  });

  const gnbsQuery = useQuery<GnbItem[], Error>({
    queryKey: [queryKeys.gnbs, auth.user?.authToken],
    queryFn: () => getGnbList(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const queries = [networkSliceQuery, upfQuery, gnbsQuery];
  if (queries.some(q => q.status === "pending") ) { return <Loader/> }
  if (queries.some(q => q.status === "error")) {
    if (queries.some(q => is401UnauthorizedError(q.error))) {
      auth.logout();
    }
    return (<><ErrorNotification error={"Failed to retrieve network slices."} /></>);
  }

  const networkSlices = networkSliceQuery.data || [];
  const upfItems = upfQuery.data || [] as UpfItem[];
  const gnbItems = gnbsQuery.data || [] as GnbItem[];
  const isInventoryCreated = (upfItems.length > 0 && gnbItems.length > 0);

  if (networkSlices.length === 0) {
    if (!isInventoryCreated){
      const message = (
        <>
          <p>To create a network slice first:</p>
          {upfItems.length === 0 && <p>- Integrate your UPF charm with the NMS charm.</p>}
          {gnbItems.length === 0 && <p>- Integrate your gNodeB charm with the NMS charm.</p>}
        </>
      );
      return (
        <>
          <EmptyStatePage
            title="No network slice available"
            message={message}
            onClick={() => window.open("https://canonical-charmed-aether-sd-core.readthedocs-hosted.com/en/latest/", "_blank")}
            buttonText="Go to Documentation"
          ></EmptyStatePage>
        </>
      );
    }
    return (
      <>
        <EmptyStatePage
          title="No network slice available"
          onClick={() => setModalData({ networkSlice: {} as NetworkSlice, action: CREATE })}
          buttonText="Create"
        ></EmptyStatePage>
        {modalData?.action == CREATE && <CreateNetworkSliceModal closeFn={() => setModalData(null)} />}
      </>
    );
  }

  const tableContent: MainTableRow[] = networkSlices.map((networkSlice) => {
    const upf = networkSlice["site-info"]?.["upf"];
    const gNodeBs = networkSlice["site-info"]?.gNodeBs || [];
    const gNodeBList = [...gNodeBs.map((gNodeB, index) => `${gNodeB.name} (tac: ${gNodeB.tac})`)];
    return {
      key: networkSlice["slice-name"],
      columns: [
        { content: networkSlice["slice-name"] },
        {
          content: networkSlice["site-info"]?.plmn?.mcc,
          className:"u-align--center",
        },
        {
          content: networkSlice["site-info"]?.plmn?.mnc,
          className:"u-align--center",
        },
        { content: networkSlice["slice-id"]?.sst + ": eMBB" },
        { content: upf ? `${upf["upf-name"]}:${upf["upf-port"]}` : "" },
        {
          content: <List items={gNodeBList} divided></List>
        },
        {
          content:
            <Button
              appearance=""
              disabled={!isInventoryCreated}
              className="u-no-margin--bottom"
              onClick={() => setModalData({ networkSlice: networkSlice, action: EDIT })}
              title="Edit"
            >
              Edit
            </Button>,
          className:"u-align--right",
        },
        {
          content:
            <DeleteNetworkSliceButton
              networkSliceName={ networkSlice["slice-name"] }
              deviceGroups={ networkSlice["site-device-group"] || [] }
            >
            </DeleteNetworkSliceButton>
        },
      ],
    };
  });

  return (
    <>
      <PageHeader title={`Network Slices (${networkSlices.length})`} colSize={12}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { networkSliceQuery.refetch(), upfQuery.refetch(),gnbsQuery.refetch() }}
          title="Refresh network slice list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button
          appearance="positive"
          disabled={!isInventoryCreated}
          onClick={() => setModalData({ networkSlice: {} as NetworkSlice, action: CREATE })}
        >
          Create
        </Button>
      </PageHeader>
      <PageContent colSize={11}>
        { !isInventoryCreated && showNotification && <Notification
            severity="caution"
            title="Inventory has not been initialized"
            onDismiss={() => setShowNotification(false)}
          >
            {upfItems.length === 0 && <p>To add UPFs to the inventory, integrate your UPF charm with the NMS charm.</p>}
            {gnbItems.length === 0 && <p>To add gNodeBs to the inventory, integrate your gNodeB charm with the NMS charm.</p>}
          </Notification>
        }
        <MainTable
          headers={[
            { content: "Name" },
            { 
              content: "MCC",
              className:"u-align--center",
            },
            { 
              content: "MNC",
              className:"u-align--center",
            },
            { content: "SST" },
            { content: "UPF" },
            {
              content: "gNodeBs",
              style: { textTransform: "none" },
            },
            { content: ""},
            {
              content: "Actions",
              className:"u-align--center",
            },
          ]}
          rows={tableContent}
          emptyStateMsg={
            <>
              <br></br>
              <p className="p-heading--4 u-no-margin--bottom u-align--center">No network slices available</p>
            </>
          }
        />
      </PageContent>
      {modalData?.action == CREATE && <CreateNetworkSliceModal closeFn={() => setModalData(null)} />}
      {modalData?.action == EDIT && <EditNetworkSliceModal networkSlice={modalData.networkSlice} closeFn={() => setModalData(null)} />}
      </>
  )
}
