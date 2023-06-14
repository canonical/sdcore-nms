"use client";
import EditSubscriber from "@/components/EditSubscriber";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import AddSubscriber from "./AddSubscriber";

import { Notification } from "@canonical/react-components";

const dummySubscribers = {
  table: [
    {
      IMSI: "123456789",
    },
    {
      IMSI: "987654321",
    },
    {
      IMSI: "345678912",
    },
    {
      IMSI: "456789123",
    },
    {
      IMSI: "567891234",
    },
    {
      IMSI: "678912345",
    },
    {
      IMSI: "789123456",
    },
    {
      IMSI: "891234567",
    },
    {
      IMSI: "912345678",
    },
    {
      IMSI: "234567891",
    },
    {
      IMSI: "112233445",
    },
    {
      IMSI: "223344556",
    },
    {
      IMSI: "334455667",
    },
    {
      IMSI: "445566778",
    },
    {
      IMSI: "556677889",
    },
    {
      IMSI: "667788990",
    },
    {
      IMSI: "778899011",
    },
    {
      IMSI: "889900112",
    },
    {
      IMSI: "990011223",
    },
    {
      IMSI: "100112233",
    },
    {
      IMSI: "210012345",
    },
    {
      IMSI: "321001234",
    },
  ],
};

export default function SubscriberTable() {
  const tableContent = dummySubscribers.table.map((subscriber) => {
    return (
      <tr key={subscriber.IMSI} className="overflow-x-scroll">
        <td>{subscriber.IMSI}</td>
        <td>
          <EditSubscriber imsi={subscriber.IMSI} key={subscriber.IMSI} />
          <DeleteSubscriberButton
            imsi={String(subscriber.IMSI)}
            key={subscriber.IMSI + "delete"}
          />
        </td>
      </tr>
    );
  });
  return (
    <div className="ml-8 flex flex-col">
      <Notification severity="caution" title="Warning">
        Configure your network in the{" "}
        <span className="italic">Network Configuration</span> tab before adding
        subscribers.
      </Notification>
      <div className="flex flex-row items-end justify-between">
        <h1 className="h1-heading--1 font-regular">Subscribers</h1>
        <AddSubscriber text="Create" />
      </div>
      <div className="w-[50rem] pt-1">
        <table aria-label="Example of formatting in the table">
          <thead>
            <tr>
              <th>IMSI</th>
              <th className="u-align--left">Actions</th>
            </tr>
          </thead>
          {tableContent}
        </table>
      </div>
    </div>
  );
}
