"use client"

import { Button, MainTable } from "@canonical/react-components"
import { CreateDeviceGroupModal, EditDeviceGroupModal, DeleteDeviceGroupButton } from "@/app/(nms)/device-groups/modals";
import { DeviceGroup } from "@/components/types";
import { getDeviceGroups } from "@/utils/getDeviceGroup";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Loader from "@/components/Loader"
import PageContent from "@/components/PageContent"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";

const CREATE = "create"
const EDIT = "edit"

type modalData = {
  deviceGroup: DeviceGroup
  action: "edit" | "create"
}

export default function DeviceGroups() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const router = useRouter()
  const deviceGroupQuery = useQuery<DeviceGroup[], Error>({
    queryKey: ['device-groups', auth.user?.authToken],
    queryFn: () => getDeviceGroups(auth.user?.authToken ?? ""),
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
              onClick={() => setModalData({ deviceGroup: deviceGroup, action: EDIT })}
              title="Edit"
            >
              {editIcon}
            </Button> 
        },
        {
          content: DeleteDeviceGroupButton({ 
            deviceGroupName: deviceGroup["group-name"], 
            networkSliceName: deviceGroup["network-slice"] || "",
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
        <Button appearance="positive" onClick={() => setModalData({ deviceGroup: {} as DeviceGroup, action: CREATE })}>
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
      {modalData?.action == EDIT && <EditDeviceGroupModal deviceGroup={modalData.deviceGroup} closeFn={() => setModalData(null)} />}
      </>
  )
}