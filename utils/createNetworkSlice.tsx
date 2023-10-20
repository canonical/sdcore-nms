interface GnbItem {
  name: string;
  tac: number;
}

interface CreateNetworkSliceArgs {
  name: string;
  mcc: string;
  mnc: string;
  upfName: string;
  upfPort: string;
  gnbList: GnbItem[];
}

export const createNetworkSlice = async ({
  name,
  mcc,
  mnc,
  upfName,
  upfPort,
  gnbList,
}: CreateNetworkSliceArgs) => {
  const sliceData = {
    "slice-id": {
      sst: "1",
      sd: "010203",
    },
    "site-device-group": null,
    "site-info": {
      "site-name": "demo",
      plmn: {
        mcc,
        mnc,
      },
      gNodeBs: gnbList,
      upf: {
        "upf-name": upfName,
        "upf-port": upfPort,
      },
    },
  };

  try {
    const response = await fetch(`/api/network-slice/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sliceData),
    });

    if (!response.ok) {
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      debugger;
      throw new Error(`Error creating network. Error code: ${response.status}`);
    }

    return response.json();
  } catch (error: unknown) {
    console.error(error);
    const details = error instanceof Error ? error.message : "Failed to configure the network.";
    throw new Error(details);
  }
};
