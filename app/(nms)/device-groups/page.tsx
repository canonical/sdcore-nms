"use client"

import { useQuery } from "@tanstack/react-query"
import { getDeviceGroups2 } from "@/utils/getDeviceGroup";
import Loader from "@/components/Loader"
import { useAuth } from "@/utils/auth"
import PageHeader from "@/components/PageHeader"
import { Button, ContextualMenu, MainTable } from "@canonical/react-components"
import PageContent from "@/components/PageContent"
import { useState } from "react"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { useRouter } from "next/navigation"
import { DeviceGroup } from "@/components/types";
import { CreateUserModal } from "@/app/(nms)/device-groups/modals";


const CREATE = "create"
const EDIT = "edit"
const DELETE = "delete"

type modalData = {
  deviceGroup: DeviceGroup
  action: "delete" | "edit" | "create"
}

export default function Users() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const router = useRouter()
  const query = useQuery<DeviceGroup[], Error>({
    queryKey: ['users', auth.user?.authToken],
    queryFn: () => getDeviceGroups2(auth.user?.authToken ?? ""),
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
  const deviceGroups = Array.from(query.data ? query.data : [])
  console.error("page", deviceGroups[0]["group-name"]);
  const tableContent: MainTableRow[] = deviceGroups.map((deviceGroup) => {
    return {
      key: deviceGroup["group-name"],
      columns: [
        { content: deviceGroup["group-name"] },
        { content: "empty" },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-ip-pool"] },
        { content: deviceGroup["ip-domain-expanded"]?.["dns-primary"] },
        { content: deviceGroup["ip-domain-expanded"]?.mtu },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"] },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"] },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.qci },
        { content: deviceGroup["ip-domain-expanded"]?.["ue-dnn-qos"]?.["traffic-class"]?.arp },
        {
          content: <ContextualMenu
            links={[
              {
                children: "Edit",
                disabled: false,
                onClick: () => setModalData({ deviceGroup: deviceGroup, action: EDIT })
              }, {
                children: "Delete",
                disabled: false,
                onClick: () => setModalData({ deviceGroup: deviceGroup, action: DELETE })
              }
            ]} hasToggleIcon />,
          className: "u-align--right"
        }],
    };
  });

  return (
    <>
      <PageHeader title={`Device Groups (${deviceGroups.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { query.refetch() }}
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
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.action == CREATE && <CreateUserModal closeFn={() => setModalData(null)} />}
      {/*{modalData?.action == DELETE && <DeleteModal user={modalData.deviceGroup} closeFn={() => setModalData(null)} />}
      {modalData?.action == EDIT && <ChangePasswordModal user={modalData.deviceGroup} closeFn={() => setModalData(null)} />}
      
        */}
      </>
  )
}