"use client"

import { useQuery } from "@tanstack/react-query"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { getDeviceGroups2 } from "@/utils/getDeviceGroup";
import Loader from "@/components/Loader"
import { useAuth } from "@/utils/auth"
import PageHeader from "@/components/PageHeader"
import { Button, MainTable } from "@canonical/react-components"
import PageContent from "@/components/PageContent"
import { useState } from "react"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useRouter } from "next/navigation"
import { DeviceGroup } from "@/components/types";
import { CreateDeviceGroupModal, EditDeviceGroupModal, DeleteDeviceGroupButton } from "@/app/(nms)/device-groups/modals";

const CREATE = "create"
const EDIT = "edit"
const DELETE = "delete"

type modalData = {
  deviceGroup: DeviceGroup
  networkSliceName: string
  action: "delete" | "edit" | "create"
}

export default function DeviceGroups() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const router = useRouter()
  const deviceGroupQuery = useQuery<DeviceGroup[], Error>({
    queryKey: ['device-groups', auth.user?.authToken],
    queryFn: () => getDeviceGroups2(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
    retry: (failureCount, error): boolean => {
      if (error.message.includes("401") || error.message.includes("403")) {
        return false
      }
      return true
    },
  })
  if (deviceGroupQuery.status == "pending") { return <Loader text="loading..." /> }
  if (deviceGroupQuery.status == "error") {
    if (deviceGroupQuery.error.message.includes("401")) {
      auth.logout()
    }
    if (deviceGroupQuery.error.message.includes("403")) {
      router.push("/")
    }
    return <p>{deviceGroupQuery.error.message}</p>
  }

  const editIcon = <EditOutlinedIcon className="device-group-action-button"/>
  const deviceGroups = Array.from(deviceGroupQuery.data ? deviceGroupQuery.data : [])
  const tableContent: MainTableRow[] = deviceGroups.map((deviceGroup) => {
    return {
      key: deviceGroup["group-name"],
      columns: [
        { content: deviceGroup["group-name"] },
        { content: deviceGroup["network-slice"] },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-ip-pool"] },
        { content: deviceGroup["ip-domain-expanded"]?.["dns-primary"] },
        { content: deviceGroup["ip-domain-expanded"]?.mtu },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"] },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"] },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.qci },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.arp },
        { content:
            <Button
              className="u-no-margin--bottom is-small"
              small
              hasIcon
              appearance={"base"}
              onClick={() => setModalData({ deviceGroup: deviceGroup, networkSliceName: deviceGroup["network-slice"], action: EDIT })}
              title="Edit"
            >
              {editIcon}
            </Button> 
        },
        {
          content: DeleteDeviceGroupButton({ 
            deviceGroupName: deviceGroup["group-name"], 
            networkSliceName: deviceGroup["network-slice"],
            subscribers: deviceGroup["imsis"]
          })
        }],
    };
  });

  return (
    <>
      <PageHeader title={`Device Groups (${deviceGroups.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { deviceGroupQuery.refetch() }}
          title="Refresh device group list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ deviceGroup: {} as DeviceGroup, networkSliceName: "", action: CREATE })}>
          Create
        </Button>
      </PageHeader>
      <PageContent>
        <MainTable
          defaultSort='"abcd"'
          defaultSortDirection="ascending"
          headers={[
            { content: "Name" },
            { content: "Network Slice" },
            { content: "Subscriber IP Pool" },
            { content: "DNS" },
            { content: "MTU" },
            { content: "MBR Downstream" },
            { content: "MBR Upstream" },
            { content: "5QI" },
            { content: "ARP" },
            { content: "Actions", className: "u-align--right" },
            { content: "Actions", className: "u-align--right" },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.action == CREATE && <CreateDeviceGroupModal closeFn={() => setModalData(null)} />}
      {modalData?.action == EDIT && <EditDeviceGroupModal deviceGroup={modalData.deviceGroup} networkSliceName={modalData.networkSliceName} closeFn={() => setModalData(null)} />}
      </>
  )
}