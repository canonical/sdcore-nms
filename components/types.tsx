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
