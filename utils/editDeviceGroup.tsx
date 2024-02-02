interface DeviceGroupArgs {
  name: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRUpstreamBps: number;
  MBRDownstreamBps: number;
}

export const editDeviceGroup = async ({
  name,
  ueIpPool,
  dns,
  mtu,
  MBRUpstreamBps,
  MBRDownstreamBps,
}: DeviceGroupArgs) => {
  const deviceGroupData = {
    "site-info": "demo",
    "ip-domain-name": "pool1",
    "ip-domain-expanded": {
      dnn: "internet",
      "ue-ip-pool": ueIpPool,
      "dns-primary": dns,
      mtu: mtu,
      "ue-dnn-qos": {
        "dnn-mbr-uplink": MBRUpstreamBps,
        "dnn-mbr-downlink": MBRDownstreamBps,
        "bitrate-unit": "bps",
        "traffic-class": {
          name: "platinum",
          arp: 6,
          pdb: 300,
          pelr: 6,
          qci: 8,
        },
      },
    },
  };

  try {
    const response = await fetch(`/api/device-group/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceGroupData),
    });

    if (!response.ok) {
      throw new Error(
        `Error updating device group. Error code: ${response.status}`,
      );
    }
    return true;
  } catch (error: unknown) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to configure the network.";
    throw new Error(details);
  }
};
