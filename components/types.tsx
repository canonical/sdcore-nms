export type NetworkSlice = {
  name: string;
  "slice-name": string;
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
    gNodeBs?: [{
      name: string;
      tac: number;
    }];
    "upf": {
      "upf-name": string;
      "upf-port": string;
    };
  };
};

export type DeviceGroup = {
  "group-name": string;
  "network-slice"?: string;
  imsis: string[];
  "site-info": string;
  "ip-domain-name": string;
  "ip-domain-expanded": {
    dnn: string;
    "ue-ip-pool": string;
    "dns-primary": string;
    "dns-secondary"?: string,
    mtu: number;
    "ue-dnn-qos": {
      "dnn-mbr-uplink": number;
      "dnn-mbr-downlink": number;
      "bitrate-unit": string;
      "traffic-class": {
        name: string;
        qci: number;
        arp: number;
        pdb: number;
        pelr: number;
      };
    };
  };
};


export type User = {
  exp: number
  role: number
  username: string
  authToken: string
}

export type UserEntry = {
  role: number
  username: string
}

export type statusResponse = {
  initialized: boolean
}

export type GnbItem = {
  name: string;
  tac: number;
}

export type UpfItem = {
  hostname: string;
  port: string;
}