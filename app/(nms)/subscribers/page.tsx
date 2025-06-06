"use client";

import { Button, Icon, List, MainTable } from "@canonical/react-components"
import { apiGetAllDeviceGroupNames } from "@/utils/deviceGroupOperations";
import { apiGetAllNetworkSlices } from "@/utils/networkSliceOperations";
import { getSubscribersTableData } from "@/utils/subscriberOperations";
import { CreateSubscriberModal, DeleteSubscriberButton, EditSubscriberModal, ViewSubscriberModal } from "@/app/(nms)/subscribers/modals";
import { SubscriberTableData } from "@/components/types";
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

import "@/app/(nms)/templates/styles.scss";

const CREATE = "create" as const;
const EDIT = "edit" as const;
const VIEW = "view" as const;

type modalData = {
  subscriber: SubscriberTableData;
  action: typeof CREATE | typeof EDIT | typeof VIEW;
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

  const deviceGroupQuery = useQuery<string[], Error>({
    queryKey: [queryKeys.deviceGroupNames, auth.user?.authToken],
    queryFn: () => apiGetAllDeviceGroupNames(auth.user?.authToken ?? ""),
    enabled: auth.user ? true : false,
  })

  const subscribersQuery = useQuery<SubscriberTableData[], Error>({
    queryKey: [queryKeys.subscribers, auth.user?.authToken],
    queryFn: () => getSubscribersTableData(auth.user?.authToken ?? ""),
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
          onClick={() => setModalData({ subscriber: {} as SubscriberTableData, action: CREATE })}
          buttonText="Create"
        ></EmptyStatePage>
        {modalData?.action == CREATE && <CreateSubscriberModal closeFn={() => setModalData(null)} />}
      </>
    );
  }

  const sortedSubscribers = [...subscribers].sort((a, b) => a.rawImsi.localeCompare(b.rawImsi));
  const tableContent: MainTableRow[] = sortedSubscribers.map((subscriber) => {
    return {
      key: subscriber.rawImsi,
      columns: [
        { content: subscriber.rawImsi },
        { content: subscriber.networkSliceName },
        { content: subscriber.deviceGroupName },
        {
          content:
            <List
              inline
              className="actions-list"
              items={[
                <Button
                  key="view"
                  hasIcon
                  dense
                  appearance="base"
                  title="View subscriber"
                  onClick={
                    () => {
                      setModalData({
                        subscriber: subscriber,
                        action: VIEW,
                      })
                    }
                  }
                >
                  <Icon name="show" />
                </Button>,
                <Button
                  key="edit"
                  hasIcon
                  dense
                  appearance="base"
                  title="Edit subscriber"
                  onClick={
                    () => {
                      setModalData({
                        subscriber: subscriber,
                        action: EDIT,
                      })
                    }
                  }
                >
                  <Icon name="edit" />
                </Button>,
                <DeleteSubscriberButton
                  key="delete"
                  rawImsi={subscriber.rawImsi}
                />,

              ]}
            />,
            className: "u-align--right"
          }
        ]
      }
  });

  return (
    <>
      <PageHeader title={`Subscribers (${subscribers.length})`} colSize={10}>
        <Button
          hasIcon
          appearance="base"
          onClick={() => { subscribersQuery.refetch(), deviceGroupQuery.refetch(), networkSlicesQuery.refetch() }}
          title="Refresh subscriber list"
        >
          <Icon name="restart" />
        </Button>
        <Button appearance="positive" onClick={() => setModalData({ subscriber: {} as SubscriberTableData, action: CREATE })}>
          Create
        </Button>
      </PageHeader>
      <PageContent colSize={8}>
        <MainTable
          headers={[
            { content: "IMSI" },
            { content: "Network Slice" },
            { content: "Device Group" },
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
                                      token={auth.user?.authToken ?? ""}
                                      closeFn={() => setModalData(null)}
                                    />
      }
      {modalData?.action == VIEW && <ViewSubscriberModal
                                      subscriber={modalData.subscriber}
                                      closeFn={() => setModalData(null)}
                                    />
      }
    </>
  )
}
