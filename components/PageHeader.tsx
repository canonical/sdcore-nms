"use client";
import React, { FC, ReactNode } from "react";
import { Col, Row, ColSize } from "@canonical/react-components";

interface Props {
  title: string;
  children: ReactNode;
  colSize?: ColSize;
}

const PageHeader: FC<Props> = ({ title, children, colSize = 8 }) => {

  return (
      <Row>
        <Col size={colSize}>
          <div className="p-panel__header">
            <h1 className="p-panel__title">{title}</h1>
            <div className="p-panel__controls">
              {children}
            </div>
          </div>
        </Col>
      </Row>
  );
};
export default PageHeader;
