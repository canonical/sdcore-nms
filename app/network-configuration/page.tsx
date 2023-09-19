"use client";
import React, { useState, useEffect } from "react";
import NetworkSliceEmptyState from "@/components/NetworkSliceEmptyState";
import {
  Row,
  Col,
  Button,
  MainTable,
  Icon,
  ICONS,
  Tabs,
} from "@canonical/react-components";
import NetworkSliceModal from "@/components/NetworkSliceModal";
import { useRouter } from "next/navigation";

export type NetworkSlice = {
  name: string;
};

export default function NetworkConfiguration() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [networkSlices, setNetworkSlices] = useState<NetworkSlice[]>([]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchNetworkSlices();
  }, []);

  const fetchNetworkSlices = async () => {
    try {
      const response = await fetch(`/api/network-slice`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch network slices");
      }
      const data = await response.json();

      const slices: NetworkSlice[] = data.map((slice: any) => ({
        name: slice,
      }));

      setNetworkSlices(slices);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleView = (slice: NetworkSlice) => {
    router.push(`/network-slice/${slice.name}`);
  };

  const handleDelete = async (slice: NetworkSlice) => {
    try {
      const response = await fetch(`/api/network-slice/${slice.name}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete network slice");
      }

      fetchNetworkSlices();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!networkSlices.length) {
    return (
      <NetworkSliceEmptyState onSliceCreatedInEmptyState={fetchNetworkSlices} />
    );
  }

  const handleSliceCreated = () => {
    fetchNetworkSlices();
  };

  return (
    <div>
      <Row>
        <Col size={6}>
          <h2>Network Slices</h2>
          <MainTable
            headers={[
              {
                content: null,
              },
              {
                content: (
                  <div className="u-align--right">
                    <Button hasIcon appearance={"positive"} small>
                      Create
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={networkSlices.map((slice) => ({
              columns: [
                { content: slice.name, role: "rowheader" },
                {
                  content: (
                    <div className="u-align--right">
                      <Button small onClick={() => handleView(slice)}>
                        View
                      </Button>

                      <Button
                        small
                        appearance={"negative"}
                        onClick={() => handleDelete(slice)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ],
            }))}
            sortable
          />
        </Col>
      </Row>
      {isModalVisible && (
        <NetworkSliceModal
          toggleModal={toggleModal}
          onSliceCreated={handleSliceCreated}
        />
      )}
    </div>
  );
}
