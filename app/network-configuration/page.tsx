"use client";
import React, { useState, useEffect } from "react";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import {
  Row,
  Col,
  Button,
  MainTable,
  Card,
  Icon,
  ICONS,
} from "@canonical/react-components";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import { deleteDeviceGroup } from "@/utils/deleteDeviceGroup";
import DeviceGroupModal from "@/components/DeviceGroupModal";
import { getNetworkSlices } from "@/utils/getNetworkSlices";

export type NetworkSlice = {
  name: string;
  SliceName: string;
  "slice-id": {
    sst: string;
    sd: string;
  };
  "site-device-group"?: string[];
  "site-info": {
    "site-name": string;
    plmn: {
      mcc: string;
      mnc: string;
    };
    gNodeBs?: [];
    upf: {
      "upf-name": string;
      "upf-port": string;
    };
  };
};

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);

  const [isNetworkSliceModalVisible, setisNetworkSliceModalVisible] =
    useState(false);
  const [isDeviceGroupModalVisible, setIsDeviceGroupModalVisible] =
    useState(false);

  const [expandedRow, setExpandedRow] = useState(null);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);
  const [deviceGroupContent, setDeviceGroupContent] = useState<any | null>(
    null,
  );

  const toggleNetworkSliceModal = () => {
    setisNetworkSliceModalVisible(!isNetworkSliceModalVisible);
  };

  const toggleDeviceGroupModal = () => {
    setIsDeviceGroupModalVisible(!isDeviceGroupModalVisible);
  };

  useEffect(() => {
    getNetworkSlices();
  }, []);

  const fetchDeviceGroup = async (deviceGroupName: string) => {
    try {
      const response = await fetch(`/api/device-group/${deviceGroupName}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch device groups");
      }
      const a = await response.json();
      console.log("Device Group: ", a);
      return a;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const [currentSliceName, setCurrentSliceName] = useState<string | null>(null);

  const handleViewDeviceGroups = async (deviceGroupNames: string[]) => {
    try {
      const groupContents = await Promise.all(
        deviceGroupNames.map((name) => fetchDeviceGroup(name)),
      );
      setDeviceGroupContent(groupContents);
      console.log("Device Groups: ", groupContents);
    } catch (error) {
      console.error("Failed to fetch device groups:", error);
    }
  };

  useEffect(() => {
    const loadNetworkSlices = async () => {
      try {
        const slices: NetworkSlice[] = await getNetworkSlices();
        setNetworkSlices(slices);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load network slices:", error);
        setLoading(false);
      }
    };

    loadNetworkSlices();
  }, []);

  const handleDeleteNetworkSlice = async (sliceName: string) => {
    try {
      const response = await fetch(`/api/network-slice/${sliceName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete network slice");
      }

      getNetworkSlices();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDeviceGroup = async (
    deviceGroupName: string,
    networkSliceName: string,
  ) => {
    try {
      await deleteDeviceGroup({
        name: deviceGroupName,
        networkSliceName: networkSliceName,
      });

      getNetworkSlices();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!networkSlices.length) {
    return (
      <NetworkSliceEmptyState onSliceCreatedInEmptyState={getNetworkSlices} />
    );
  }

  const handleSliceCreated = () => {
    getNetworkSlices();
  };

  const handleToggleRow = async (slice: NetworkSlice) => {
    const sliceKey = `device-groups-${slice.SliceName}`;

    if (expandedRow === sliceKey) {
      setExpandedRow(null);
    } else {
      if (slice["site-device-group"]) {
        await handleViewDeviceGroups(slice["site-device-group"]);
      }
      setExpandedRow(sliceKey);
    }
  };

  return (
    <div>
      <Row>
        <Col size={6}>
          <h2>Network Slices</h2>
          <div className="u-align--right">
            <Button appearance={"positive"} onClick={toggleNetworkSliceModal}>
              Create
            </Button>
          </div>
          {networkSlices.map((slice) => (
            <Card key={slice.SliceName} title={slice.SliceName}>
              {
                <MainTable
                  expanding
                  headers={[
                    {
                      content: "",
                    },
                    {
                      content: "",
                    },
                  ]}
                  rows={[
                    {
                      columns: [
                        { content: "MCC" },
                        {
                          content: slice["site-info"]?.plmn.mcc || "N/A",
                          className: "u-align--right",
                        },
                      ],
                      key: `mcc-${slice.SliceName}`,
                    },
                    {
                      columns: [
                        { content: "MNC" },
                        {
                          content: slice["site-info"]?.plmn.mnc || "N/A",
                          className: "u-align--right",
                        },
                      ],
                      key: `mnc-${slice.SliceName}`,
                    },
                    {
                      columns: [
                        { content: "UPF" },
                        {
                          content: `${
                            slice["site-info"]?.upf?.["upf-name"] || "N/A"
                          }:${slice["site-info"]?.upf?.["upf-port"] || "N/A"}`,

                          className: "u-align--right",
                        },
                      ],
                      key: `upf-${slice.SliceName}`,
                    },
                    {
                      columns: [
                        { content: "gNodeBs" },
                        {
                          content:
                            slice?.["site-info"]?.gNodeBs?.length.toString() ||
                            "N/A",
                          className: "u-align--right",
                        },
                      ],
                      key: `gNodeBs-${slice.SliceName}`,
                    },
                    {
                      columns: [
                        { content: "Device Groups" },
                        {
                          content: (
                            <div className="u-align--right">
                              <Button
                                className="u-toggle"
                                small
                                hasIcon
                                appearance={"base"}
                                onClick={() => {
                                  setCurrentSliceName(slice.SliceName);
                                  toggleDeviceGroupModal();
                                }}
                              >
                                <Icon name={ICONS.plus} />
                              </Button>
                              <Button
                                small
                                hasIcon
                                disabled={
                                  !slice["site-device-group"] ||
                                  slice["site-device-group"].length === 0
                                }
                                appearance={"base"}
                                onClick={() => handleToggleRow(slice)}
                              >
                                <Icon name={ICONS.chevronDown} />
                              </Button>
                            </div>
                          ),
                        },
                      ],
                      expandedContent: (deviceGroupContent || []).map(
                        (deviceGroup, index: number) => (
                          <Row key={`deviceGroupRow-${index}`}>
                            <Col size={8}>
                              <MainTable
                                headers={[
                                  {
                                    content: deviceGroup.DeviceGroupName,
                                  },
                                  {
                                    content: (
                                      <div className="u-align--right">
                                        <Button
                                          appearance={"base"}
                                          small
                                          onClick={() =>
                                            handleDeleteDeviceGroup(
                                              deviceGroup.DeviceGroupName,
                                              slice.SliceName,
                                            )
                                          }
                                        >
                                          <Icon name={ICONS.delete} />
                                        </Button>
                                      </div>
                                    ),
                                    className: "u-align--right",
                                  },
                                ]}
                                rows={[
                                  {
                                    columns: [
                                      { content: "Subscriber IP Pool" },
                                      {
                                        content:
                                          deviceGroup["ip-domain-expanded"]?.[
                                            "ue-ip-pool"
                                          ] || "N/A",
                                        className: "u-align--right",
                                      },
                                    ],
                                  },
                                  {
                                    columns: [
                                      { content: "DNS" },
                                      {
                                        content:
                                          deviceGroup["ip-domain-expanded"]?.[
                                            "dns-primary"
                                          ] || "N/A",
                                        className: "u-align--right",
                                      },
                                    ],
                                  },
                                  {
                                    columns: [
                                      { content: "MTU" },
                                      {
                                        content:
                                          deviceGroup["ip-domain-expanded"]?.[
                                            "mtu"
                                          ] || "N/A",
                                        className: "u-align--right",
                                      },
                                    ],
                                  },
                                  {
                                    columns: [
                                      {
                                        content: "Maximum Bitrate - Downstream",
                                      },
                                      {
                                        content: deviceGroup[
                                          "ip-domain-expanded"
                                        ]?.["ue-dnn-qos"]?.["dnn-mbr-downlink"]
                                          ? `${
                                              deviceGroup["ip-domain-expanded"][
                                                "ue-dnn-qos"
                                              ]["dnn-mbr-downlink"] / 1_000_000
                                            } Mbps`
                                          : "N/A",
                                        className: "u-align--right",
                                      },
                                    ],
                                  },
                                  {
                                    columns: [
                                      {
                                        content: "Maximum Bitrate - Upstream",
                                      },
                                      {
                                        content: deviceGroup[
                                          "ip-domain-expanded"
                                        ]?.["ue-dnn-qos"]?.["dnn-mbr-uplink"]
                                          ? `${
                                              deviceGroup["ip-domain-expanded"][
                                                "ue-dnn-qos"
                                              ]["dnn-mbr-uplink"] / 1_000_000
                                            } Mbps`
                                          : "N/A",
                                        className: "u-align--right",
                                      },
                                    ],
                                  },
                                ]}
                              />
                            </Col>
                          </Row>
                        ),
                      ),
                      expanded:
                        expandedRow === `device-groups-${slice.SliceName}`,
                      key: `device-groups-${slice.SliceName}`,
                    },
                  ]}
                />
              }

              <hr />
              <div className="u-align--right">
                <Button
                  appearance={"negative"}
                  onClick={() => handleDeleteNetworkSlice(slice.SliceName)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </Col>
      </Row>
      {isNetworkSliceModalVisible && (
        <NetworkSliceModal
          toggleModal={toggleNetworkSliceModal}
          onSliceCreated={handleSliceCreated}
        />
      )}
      {isDeviceGroupModalVisible && (
        <DeviceGroupModal
          toggleModal={toggleDeviceGroupModal}
          onDeviceGroupCreated={getNetworkSlices}
          networkSliceName={currentSliceName}
        />
      )}
    </div>
  );
}
