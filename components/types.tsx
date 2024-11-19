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