import React, { FC } from "react";

const Logo: FC = () => {
  return (
    <a className="logo" href="/">
      <div className="logo-tag">
        <img
          src="https://assets.ubuntu.com/v1/82818827-CoF_white.svg"
          alt="circle of friends"
          className="logo-image"
        />
      </div>
      <span className="logo-text p-heading--4">5G NMS</span>
    </a>
  );
};

export default Logo;
