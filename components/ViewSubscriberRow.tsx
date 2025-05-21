import React, { FC } from "react";
import { Button, Col, Row } from "@canonical/react-components";

interface Props {
  fieldName: string;
  fieldValue: string;
}

const ViewSubscriberRow: FC<Props> = ({ fieldName, fieldValue}) => {
  return (
    <Row>
      <Col size={3}>{fieldName}</Col>
      <Col size={9}>
        <Row className="p-form__control">
          <Col size={7}>
              <div>{fieldValue}</div>
          </Col>
          <Col size={2}>
            <div className="u-align--right">
              <Button
                appearance="positive"
                type="button"
                onClick={() => {navigator.clipboard.writeText(fieldValue)}}
              >
                Copy
              </Button>
            </div>
          </Col>
        </Row>
      </Col>
      </Row>
  );
};
export default ViewSubscriberRow;
