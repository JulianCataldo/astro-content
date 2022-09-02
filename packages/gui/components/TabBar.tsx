import { Icon } from '@iconify/react';
import cx from 'classnames';
/* ·········································································· */
import './TabBar.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export type Tabs = Record<string, { button: { icon?: string; title: string } }>;

interface Props {
  tabs: Tabs;
  switchPane: (index: string) => void;
  currentTab: string;
}
export default function Entity({ tabs, switchPane, currentTab }: Props) {
  return (
    <div className="component-tab-bar">
      {Object.entries(tabs).map(([index, tab]) => (
        <div
          key={index}
          className={cx(currentTab === index && 'active', 'tab')}
          onClick={() => switchPane(index)}
        >
          {tab.button.icon && <Icon icon={tab.button.icon} />}

          <span className="tab-label"> {tab?.button?.title}</span>
        </div>
      ))}
    </div>
  );
}
