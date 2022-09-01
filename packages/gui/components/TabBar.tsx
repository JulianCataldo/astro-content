/* ·········································································· */
import './TabBar.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export type Tabs = Record<string, { button: { title: string } }>;

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
          className={currentTab === index ? 'active' : ''}
          onClick={() => switchPane(index)}
        >
          {tab?.button?.title}
        </div>
      ))}
    </div>
  );
}
