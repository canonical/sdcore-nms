import { ReactNode } from "react";
import CreateNSWizard from "./CreateNSWizard";

export default function NetworkSliceConfiguration(): ReactNode {
  return (
    <div className="flex flex-col justify-between items-start">
      <h1 className="h1-heading--1">Network Slice Configuration</h1>
      <CreateNSWizard />
    </div>
  );
}
