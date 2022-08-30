/* ·········································································· */
import './TabBar.scss';
/* —————————————————————————————————————————————————————————————————————————— */

export default function Entity({ tabs, switchPane, currentTab }) {
  return (
    <div className="component-tab-bar">
      {tabs.map((tab, index) => (
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
