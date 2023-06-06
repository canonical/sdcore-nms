"use client";
import EditSubscriber from "@/components/EditSubscriber";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import AddSubscriber from "./AddSubscriber";

const dummySubscribers = {
  table: [
    {
      IMSI: "123456789",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice A",
      "Slice ID": "001",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
    {
      IMSI: "987654321",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice B",
      "Slice ID": "002",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
    {
      IMSI: "123456789",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice A",
      "Slice ID": "001",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
    {
      IMSI: "987654321",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice B",
      "Slice ID": "002",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
    {
      IMSI: "123456789",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice A",
      "Slice ID": "001",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
    {
      IMSI: "987654321",
      "PLMN ID": "PLMN001",
      "Network Slice": "Slice B",
      "Slice ID": "002",
      ST: "Standard",
      DNN: "example.com",
      MBR: "100 Mbps",
      Uplink: "50 Mbps",
      Downlink: "100 Mbps",
      QOS: "High",
      QCI: "8",
      ARP: "3",
    },
  ],
};

export default function SubscriberTable() {
  const tableContent = dummySubscribers.table.map((subscriber) => {
    return (
      <tr key={subscriber.IMSI} className="overflow-x-scroll">
        <td>{subscriber.IMSI}</td>
        <td>{subscriber["PLMN ID"]}</td>
        <td>{subscriber["Network Slice"]}</td>
        <td>{subscriber["Slice ID"]}</td>
        <td>{subscriber.ST}</td>
        <td>{subscriber.DNN}</td>
        <td>{subscriber.MBR}</td>
        <td>{subscriber.Uplink}</td>
        <td>{subscriber.Downlink}</td>
        <td>{subscriber.QOS}</td>
        <td>{subscriber.QCI}</td>
        <td>{subscriber.ARP}</td>
        <td>
          <EditSubscriber imsi={subscriber.IMSI} key={subscriber.IMSI} />
        </td>
        <td>
          <DeleteSubscriberButton
            imsi={String(subscriber.IMSI)}
            key={subscriber.IMSI + "delete"}
          />
        </td>
      </tr>
    );
  });
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-end">
        <h1 className="h1-heading--1 font-regular">Subscribers</h1>
        <AddSubscriber />
      </div>
      <div className="pt-1 w-fit">
        <table aria-label="Example of formatting in the table">
          <thead>
            <tr>
              <th>IMSI</th>
              <th>PLMN ID</th>
              <th className="u-align--left">Network Slice</th>
              <th className="u-align--left">Slice ID</th>
              <th className="u-align--left">ST</th>
              <th className="u-align--left">DNN</th>
              <th className="u-align--left">MBR</th>
              <th className="u-align--left">Uplink</th>
              <th className="u-align--left">Downlink</th>
              <th className="u-align--left">QOS</th>
              <th className="u-align--left">QCI</th>
              <th className="u-align--left">ARP</th>
              <th className="u-align--left">Actions</th>
            </tr>
          </thead>
          {tableContent}
        </table>
      </div>
    </div>
  );
}
