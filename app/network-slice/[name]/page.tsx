"use client";
import React, { useState, useEffect } from "react";

import {
  Row,
  Col,
  Badge,
  Button,
  MainTable,
  List,
  Strip,
  ICONS,
  Chip,
  Icon,
} from "@canonical/react-components";

import DeviceGroupEmptyState from "@/components/DeviceGroupEmptyState";
import DeviceGroupModal from "@/components/DeviceGroupModal";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";

type NetworkSlice = {
  SliceName: string;
  "slice-id": {
    sst: string;
    sd: string;
  };
  "site-device-group": any;
  "site-info": {
    "site-name": string;
    plmn: {
      mcc: string;
      mnc: string;
    };
    gNodeBs: any;
    upf: {
      "upf-name": string;
      "upf-port": string;
    };
  };
};

export default function NetworkSlice({ params }: { params: { name: string } }) {
  const [data, setData] = useState<NetworkSlice | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleDeviceGroupCreated = () => {};

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const fetchNetworkSlice = async () => {
    try {
      const response = await fetch(`/api/network-slice/${params.name}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch network slice");
      }
      const fetchedData: NetworkSlice = await response.json();
      setData(fetchedData);
    } catch (error) {
      console.error(error);
      setHasError(true);
    }
  };

  useEffect(() => {
    fetchNetworkSlice();
  }, [params.name]);

  if (hasError) {
    return <div>404: Network Slice Not Found</div>;
  }

  const mcc = data?.["site-info"]?.plmn.mcc || "N/A";
  const mnc = data?.["site-info"]?.plmn.mnc || "N/A";
  const upfName = data?.["site-info"]?.upf["upf-name"] || "N/A";
  const upfPort = data?.["site-info"]?.upf["upf-port"] || "N/A";
  const upf = `${upfName}:${upfPort}`;
  const gnbNum = data?.["site-info"]?.gNodeBs?.length || 0;

  const deviceGroups = data?.["site-device-group"] || [];

  const handleDelete = async (
    deviceGroupName: string,
    networkSliceName: string,
  ) => {
    try {
      await deleteDeviceGroup({
        name: deviceGroupName,
        networkSliceName: networkSliceName,
      });

      fetchNetworkSlice();
    } catch (error) {
      console.error(error);
    }
  };
  console.log("Number of device groups: ", deviceGroups.length);
  console.log(data?.["site-device-group"]);

  return (
    <div>
      <Row>
        <Col size={6}>
          <h2 className="h2-heading--1 font-regular">
            <span style={{ color: "grey" }}>Network Slice:</span>
            <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
              {params.name}
            </span>
          </h2>
          <Chip lead="MCC" value={mcc} />
          <Chip lead="MNC" value={mnc} />
          <Chip lead="UPF" value={upf} quoteValue={true} />
          <Chip lead="gNodeBs" value={gnbNum} />
          {deviceGroups.length === 0 ? (
            <DeviceGroupEmptyState
              onDeviceGroupCreatedInEmptyState={fetchNetworkSlice}
              networkSliceName={params.name}
            />
          ) : (
            <div>
              <h3>Device Groups</h3>
              <MainTable
                headers={[
                  {
                    content: null,
                  },
                  {
                    content: (
                      <div className="u-align--right">
                        <Button
                          hasIcon
                          appearance={"positive"}
                          small
                          onClick={toggleModal}
                        >
                          Create
                        </Button>
                      </div>
                    ),
                  },
                ]}
                rows={deviceGroups.map(
                  (deviceGroupName: string, index: number) => ({
                    columns: [
                      { content: deviceGroupName },
                      {
                        content: (
                          <div className="u-align--right">
                            <Button small>View</Button>
                            <Button
                              small
                              appearance="negative"
                              onClick={() => {
                                handleDelete(deviceGroupName, params.name);
                              }}
                              style={{ marginLeft: "10px" }}
                            >
                              Delete
                            </Button>
                          </div>
                        ),
                      },
                    ],
                    key: index,
                    sortData: {
                      deviceGroupName: deviceGroupName,
                    },
                  }),
                )}
              />
            </div>
          )}
        </Col>
      </Row>
      {isModalVisible && (
        <DeviceGroupModal
          toggleModal={toggleModal}
          onDeviceGroupCreated={handleDeviceGroupCreated}
          networkSliceName={params.name}
        />
      )}
    </div>
  );
}
