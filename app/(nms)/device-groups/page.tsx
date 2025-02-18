"use client"

import { Button, MainTable, Notification } from "@canonical/react-components"
import { CreateDeviceGroupModal, EditDeviceGroupModal, DeleteDeviceGroupButton } from "@/app/(nms)/device-groups/modals";
import { DeviceGroup } from "@/components/types";
import { getDeviceGroups } from "@/utils/deviceGroupOperations";
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
  deviceGroup: DeviceGroup
  action: typeof CREATE | typeof EDIT;
}

export default function DeviceGroups() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const deviceGroupQuery = useQuery<DeviceGroup[], Error>({
    queryKey: ['device-groups'],
    queryFn: () => getDeviceGroups(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error instanceof WebconsoleApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
  if (deviceGroupQuery.status == "pending") { return <Loader text="loading..." /> }
  if (deviceGroupQuery.status == "error") {
    if (deviceGroupQuery.error instanceof WebconsoleApiError && deviceGroupQuery.error.status === 401) {
        auth.logout();
    } 
    return (
      <>
        <Notification severity="negative" title="Error">
          Failed to retrieve device groups.
        </Notification>
      </>
    )
  }

  const deviceGroups = Array.from(deviceGroupQuery.data ? deviceGroupQuery.data : [])
  const tableContent: MainTableRow[] = deviceGroups.map((deviceGroup) => {
    return {
      key: deviceGroup["group-name"],
      columns: [
        { content: deviceGroup["group-name"] },
        { content: deviceGroup["network-slice"] },
        {
          content: deviceGroup["ip-domain-expanded"]?.["ue-ip-pool"],
          hasOverflow: true,
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.["dns-primary"],
          className:"u-align--right",
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.mtu,
          className:"u-align--right",
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"] / 1_000_000,
          className:"u-align--right",
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"] / 1_000_000,
          className:"u-align--right",
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.qci,
          className:"u-align--right",
        },
        {
          content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.arp,
          className:"u-align--right",
        },
        {
          content:
            <Button
              appearance=""
              className="u-no-margin--bottom"
              onClick={() => setModalData({ deviceGroup: deviceGroup, action: EDIT })}
              title="Edit"
            >
              Edit
            </Button>,
          className:"u-align--right",
        },
        { content:
          <DeleteDeviceGroupButton 
            deviceGroupName={deviceGroup["group-name"]}
            networkSliceName={deviceGroup["network-slice"] || ""}
            subscribers={deviceGroup["imsis"]}
          >
          </DeleteDeviceGroupButton>
        },
      ],
    };
  });

  return (
    <>
      <PageHeader title={`Device Groups (${deviceGroups.length})`} colSize={12}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { deviceGroupQuery.refetch() }}
          title="Refresh device group list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ deviceGroup: {} as DeviceGroup, action: CREATE })}>
          Create
        </Button>
      </PageHeader>
      <PageContent colSize={11}>
        <MainTable
          headers={[
            { content: "Name" },
            { content: "Network Slice" },
            { content: "Subscriber IP Pool" },
            {
              content: "DNS",
              className:"u-align--right",
            },
            {
              content: "MTU",
              className:"u-align--right",
            },
            {
              content: "MBR Downstream",
              className:"u-align--right",
            },
            {
              content: "MBR Upstream",
              className:"u-align--right",
            },
            {
              content: "5QI",
              className:"u-align--right",
            },
            {
              content: "ARP",
              className:"u-align--right",
            },
            { content: ""},
            {
              content: "Actions",
              className:"u-align--right",
            },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.action == CREATE && <CreateDeviceGroupModal closeFn={() => setModalData(null)} />}
      {modalData?.action == EDIT && <EditDeviceGroupModal deviceGroup={modalData.deviceGroup} closeFn={() => setModalData(null)} />}
      </>
  )
}