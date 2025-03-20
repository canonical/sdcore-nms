"use client";
import React, { FC, ReactNode } from "react";
import { Col, Row, ColSize } from "@canonical/react-components";

interface Props {
  children: ReactNode;
  colSize?: ColSize;
}

const PageContent: FC<Props> = ({ children, colSize = 6 }) => {
  return (
    <Row>
      <Col size={colSize}>
        <div className="p-panel__content">{children}</div>
      </Col>
    </Row>
  );
};
export default PageContent;
