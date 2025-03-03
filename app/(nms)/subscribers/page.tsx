"use client"

import { Button, MainTable } from "@canonical/react-components"
import { getDeviceGroups } from "@/utils/deviceGroupOperations";
import { apiGetAllNetworkSlices } from "@/utils/networkSliceOperations";
import { getSubscribersAuthData } from "@/utils/subscriberOperations";
import { CreateSubscriberModal, DeleteSubscriberButton, EditSubscriberModal } from "@/app/(nms)/subscribers/modals";
import { DeviceGroup, SubscriberAuthData } from "@/components/types";
import { is401UnauthorizedError }  from "@/utils/errors";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable"
import { queryKeys } from "@/utils/queryKeys";
import { useAuth } from "@/utils/auth"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { useState } from "react"

import EmptyStatePage from "@/components/EmptyStatePage";
import ErrorNotification from "@/components/ErrorNotification";
import Loader from "@/components/Loader"
import PageContent from "@/components/PageContent"
import PageHeader from "@/components/PageHeader"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";


const CREATE = "create" as const;
const EDIT = "edit" as const;

type modalData = {
  subscriber: SubscriberAuthData;
  networkSliceName: string;
  deviceGroupName: string;
  action: typeof CREATE | typeof EDIT;
}

function findDeviceGroupByImsi(deviceGroups: DeviceGroup[], imsi: string): {
  deviceGroupName: string;  
  networkSliceName: string;
} | null {
  const foundGroup = deviceGroups.find(group => group.imsis.includes(imsi));

  return foundGroup 
    ? { deviceGroupName: foundGroup["group-name"], networkSliceName: foundGroup["network-slice"] ?? "" }
    : null;
}

export default function Subscribers() {
  const [modalData, setModalData] = useState<modalData | null>(null);
  const auth = useAuth()
  const router = useRouter();

  const networkSlicesQuery = useQuery<string[], Error>({
    queryKey: [queryKeys.networkSliceNames, auth.user?.authToken],
    queryFn: () => apiGetAllNetworkSlices(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const deviceGroupQuery = useQuery<DeviceGroup[], Error>({
    queryKey: [queryKeys.deviceGroups, auth.user?.authToken],
    queryFn: () => getDeviceGroups(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const subscribersQuery = useQuery<SubscriberAuthData[], Error>({
    queryKey: [queryKeys.subscribers, auth.user?.authToken],
    queryFn: () => getSubscribersAuthData(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const queries = [networkSlicesQuery, deviceGroupQuery, subscribersQuery];
  if (queries.some(q => q.status === "pending") ) { return <Loader/> }

  if (queries.some(q => q.status === "error")) {
    if (queries.some(q => is401UnauthorizedError(q.error))) {
      auth.logout();
    }
    return (<><ErrorNotification error={"Failed to retrieve subscribers."} /></>);
  }

  const networkSlices = networkSlicesQuery.data || [];
  if (networkSlices.length === 0) {
    return (
      <>
        <EmptyStatePage
          title="No subscriber available"
          message="To create a subscriber, first create a network slice and a device group."
          onClick={() => router.push("/network-configuration")}
          buttonText="Go to the &quot;Network Slices&quot; page"
        ></EmptyStatePage>
      </>
    );
  }

  const deviceGroups = deviceGroupQuery.data || [];
  if (deviceGroups.length === 0) {
    return (
      <>
        <EmptyStatePage
          title="No subscriber available"
          message="To create a subscriber, first create a device group."
          onClick={() => router.push("/device-groups")}
          buttonText="Go to the &quot;Device Groups&quot; page"
        ></EmptyStatePage>
      </>
    );
  }

  const subscribers = subscribersQuery.data || [];
  if (subscribers.length === 0) {
    return (
      <>
        <EmptyStatePage
          title="No subscriber available"
          onClick={() => setModalData({ subscriber: {} as SubscriberAuthData, networkSliceName:"", deviceGroupName:"", action: CREATE })}
          buttonText="Create"
        ></EmptyStatePage>
        {modalData?.action == CREATE && <CreateSubscriberModal closeFn={() => setModalData(null)} />}
      </>
    );
  }

  const tableContent: MainTableRow[] = subscribers.map((subscriber) => {
    return {
      key: subscriber.rawImsi,
      columns: [
        { content: subscriber.rawImsi },
        {
          content:
            <Button
              appearance=""
              className="u-no-margin--bottom"
              onClick={() => {
                const subscriberDeviceGroup = findDeviceGroupByImsi(deviceGroups, subscriber.rawImsi);
                setModalData({
                  subscriber: subscriber,
                  networkSliceName: subscriberDeviceGroup?.networkSliceName || "",
                  deviceGroupName: subscriberDeviceGroup?.deviceGroupName || "",
                  action: EDIT,
                });
              }}
              title="Edit"
            >
              Edit
            </Button>,
          className:"u-align--right",
        },
        {
          content:
            <DeleteSubscriberButton rawImsi={subscriber.rawImsi} />
        },
      ],
    };
  });

  return (
    <>
      <PageHeader title={`Subscribers (${subscribers.length})`}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { subscribersQuery.refetch(), deviceGroupQuery.refetch(), networkSlicesQuery.refetch() }}
          title="Refresh subscriber list"
        >
          <SyncOutlinedIcon style={{ color: "#666" }} />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ subscriber: {} as SubscriberAuthData, networkSliceName:"", deviceGroupName:"", action: CREATE })}>
          Create
        </Button>
      </PageHeader>
      <PageContent>
        <MainTable
          headers={[
            { content: "Name" },
            { content: ""},
            {
              content: "Actions",
              className:"u-align--right",
            },
          ]}
          rows={tableContent}
        />
      </PageContent>
      {modalData?.action == CREATE && <CreateSubscriberModal closeFn={() => setModalData(null)} />}
      {modalData?.action == EDIT && <EditSubscriberModal
                                      subscriber={modalData.subscriber}
                                      previousNetworkSlice={modalData.networkSliceName || ""}
                                      previousDeviceGroup={modalData.deviceGroupName || ""}
                                      token={auth.user?.authToken ?? ""}
                                      closeFn={() => setModalData(null)}
                                    />
      }
    </>
  )
}