"use client"

import { Button, EmptyState, MainTable, Notification } from "@canonical/react-components"
import { CreateNetworkSliceModal, EditNetworkSliceModal, DeleteNetworkSliceButton } from "@/app/(nms)/network-configuration/modals";
import { NetworkSlice } from "@/components/types";
import { getNetworkSlices } from "@/utils/networkSliceOperations";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { WebconsoleApiError }  from "@/utils/errors";

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
  const auth = useAuth()
  const networkSliceQuery = useQuery<NetworkSlice[], Error>({
    queryKey: ['network-slices'],
    queryFn: () => getNetworkSlices(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error instanceof WebconsoleApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
  if (networkSliceQuery.status == "pending") { return <Loader text="loading..." /> }
  if (networkSliceQuery.status == "error") {
    if (networkSliceQuery.error instanceof WebconsoleApiError && networkSliceQuery.error.status === 401) {
        auth.logout();
    } 
    return (
      <>
        <Notification severity="negative" title="Error">
          Failed to retrieve network slices.
        </Notification>
      </>
    )
  }

  const networkSlices = networkSliceQuery.data || []
  const tableContent: MainTableRow[] = networkSlices.map((networkSlice) => {
    return {
      key: networkSlice["slice-name"],
      columns: [
        { content: networkSlice["slice-name"] },
        {
          content: networkSlice["site-info"]?.plmn?.mcc,
          className:"u-align--right",
        },
        {
          content: networkSlice["site-info"]?.plmn?.mnc,
          className:"u-align--right",
        },
        {
          content: networkSlice["slice-id"]?.sst,
          className:"u-align--right",

        },
        { content: networkSlice["site-info"]?.["upf"] ? `${networkSlice["site-info"]["upf"]["upf-name"]}:${networkSlice["site-info"]["upf"]["upf-port"]}` : "" },
        { content: "gnbs"  },
        {
          content:
            <Button
              appearance=""
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
          onClick={() => { networkSliceQuery.refetch() }}
          title="Refresh network slice list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ networkSlice: {} as NetworkSlice, action: CREATE })}>
          Create
        </Button>
      </PageHeader>
      <PageContent colSize={11}>
        <MainTable
          headers={[
            { content: "Name" },
            { 
              content: "MCC",
              className:"u-align--right",
            },
            { 
              content: "MNC",
              className:"u-align--right",
            },
            { 
              content: "SST",
              className:"u-align--right",
            },
            { content: "UPF" },
            {
              content: "gNodeBs (name:tac)",
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