import React from "react";
import { Notification } from "@canonical/react-components"

interface ErrorNotificationProps {
  error?: string | null;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Notification severity="negative" title="Error">
      {error}
    </Notification>
  );
};

export default ErrorNotification;