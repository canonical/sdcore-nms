import React, { FC, MouseEvent, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { usePathname } from "next/navigation";
import { useAuth } from "@/utils/auth";
import classnames from "classnames";
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import Logo from "@/components/Logo"

const Navigation: FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setCollapsed] = useState(false);

  const auth = useAuth()
  const softToggleMenu = () => {
    if (window.innerWidth < 620) {
      setCollapsed((prev) => !prev);
    }
  };

  const hardToggleMenu = (e: MouseEvent<HTMLElement>) => {
    setCollapsed((prev) => !prev);
    e.stopPropagation();
  };

  if (pathname == '/login' || pathname == '/initialize') {
    return <></>
  }

  return (
    <>
      <header className="l-navigation-bar">
        <div className="p-panel is-dark">
          <div className="p-panel__header">
            <Logo />
            <div className="p-panel__controls">
              <Button
                dense
                className="p-panel__toggle"
                onClick={hardToggleMenu}
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      </header>
      <nav
        aria-label="main navigation"
        className={classnames("l-navigation", {
          "is-collapsed": isCollapsed,
          "is-pinned": !isCollapsed,
        })}
        onClick={softToggleMenu}
      >
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
              <Logo />
              <div className="p-panel__controls u-hide--medium u-hide--large">
                <Button
                  appearance="base"
                  hasIcon
                  className="u-no-margin"
                  aria-label="close navigation"
                  onClick={hardToggleMenu}
                >
                  <Icon name="close" />
                </Button>
              </div>
            </div>
            <div className="p-panel__content">
              <div className="p-side-navigation--icons is-dark">
                <ul className="p-side-navigation__list sidenav-top-ul">
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="/network-configuration"
                      title="Network slices"
                      aria-current={
                        pathname === "/network-configuration"
                          ? "page"
                          : undefined
                      }
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="connected"
                      />{" "}
                      Network slices
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="/device-groups"
                      title="Device groups"
                      aria-current={
                        pathname === "/device-groups" ? "page" : undefined
                      }
                    >
                      <TuneOutlinedIcon
                        className="is-light p-side-navigation__icon"
                        fontSize="inherit"
                        style={{ color: "#fff" }}
                      />
                      Device groups
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href={`/subscribers`}
                      title={`Subscribers`}
                      aria-current={
                        pathname === "/subscribers" ? "page" : undefined
                      }
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="profile"
                      />{" "}
                      Subscribers
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="/inventory"
                      title="Inventory"
                      aria-current={
                        pathname === "/inventory" ? "page" : undefined
                      }
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="pods"
                      />{" "}
                      Inventory
                    </a>
                  </li>
                  {auth.user?.role == 1 && <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href={`/users`}
                      title={`Users`}
                      aria-current={
                        pathname === "/users" ? "page" : undefined
                      }
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="user-group"
                      />{" "}
                      Users
                    </a>
                  </li>}
                </ul>
                <ul className="p-side-navigation__list">
                  <li>
                    <a
                      className="p-side-navigation__link"
                      onClick={auth.logout}
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="log-out"
                      />
                      Log out
                    </a>
                  </li>
                </ul>
                <ul className="p-side-navigation__list sidenav-bottom-ul">
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="/api"
                      target="_blank"
                      rel="noreferrer"
                      title="API"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="code"
                      />{" "}
                      API
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://canonical-charmed-aether-sd-core.readthedocs-hosted.com/en/latest/"
                      target="_blank"
                      rel="noreferrer"
                      title="Documentation"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="information"
                      />{" "}
                      Documentation
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://github.com/canonical/charmed-aether-sd-core/issues/new/choose"
                      target="_blank"
                      rel="noreferrer"
                      title="Report a bug"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="submit-bug"
                      />{" "}
                      Report a bug
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="sidenav-toggle-wrapper">
              <Button
                appearance="base"
                aria-label={`${isCollapsed ? "expand" : "collapse"
                  } main navigation`}
                hasIcon
                dense
                className="sidenav-toggle is-dark u-no-margin l-navigation-collapse-toggle u-hide--small"
                onClick={hardToggleMenu}
              >
                <Icon light name="sidebar-toggle" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
