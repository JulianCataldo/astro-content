import { Icon } from '@iconify/react';
import cx from 'classnames';
/* ·········································································· */
import './TabBar.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export type Tabs = Record<string, { icon?: string; title: string }>;

interface Props {
  tabs: Tabs;
  switchPane: (index: string) => void;
  currentTab: string;
  defaultTab: string;
}
export default function Entity({
  tabs,
  switchPane,
  currentTab,
  defaultTab,
}: Props) {
  let hasTab = false;
  Object.entries(tabs).forEach(([index /* , tab */]) => {
    if (currentTab === index) {
      hasTab = true;
    }
  });

  return (
    <div className="component-tab-bar">
      {/* <div className="scroller"> */}
      {Object.entries(tabs).map(([index, tab]) => (
        // FIXME: JSX A11y
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          key={index}
          className={cx(
            (currentTab === index || (!hasTab && index === defaultTab)) &&
              'active',
            'tab',
          )}
          onClick={() => switchPane(index)}
        >
          {tab.icon && <Icon icon={tab.icon} height="1.3em" width="1.3em" />}

          <span className="tab-label"> {tab.title}</span>
        </div>
      ))}
      {/* </div> */}
    </div>
  );
}
