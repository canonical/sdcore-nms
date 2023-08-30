"use client";
import { useState } from "react";
import { Button } from "@canonical/react-components";
import CreateSubscriberModal from "@/components/CreateSubscriberModal";

type Props = {
  text: string;
  currentSubscribers: string[];
  disabled: boolean;
};

export default function CreateSubscriberButton({
  text, 
  currentSubscribers, 
  disabled, 
}: Props) {
  const [isCreateSubscriberModalVisible, setIsCreateSubscriberModalVisible] =
    useState<boolean>(false);

  const toggleCreateSubscriberModal = () => {
    setIsCreateSubscriberModalVisible(!isCreateSubscriberModalVisible);
  };

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        onClick={toggleCreateSubscriberModal}
        disabled={disabled}
      >
        {text}
      </Button>
      {isCreateSubscriberModalVisible && (
        <CreateSubscriberModal 
          toggleModal={toggleCreateSubscriberModal} 
          currentSubscribers={currentSubscribers} 
        />
      )}
    </>
  );
}
