export default function Meta({ value }) {
  return (
    <div>
      <div className="meta">
        <h2>Meta</h2>
        <div>
          <h3>Excerpt</h3>
          Length: {value?.excerpt?.text.length}
          <div>
            <h4>Formatted</h4>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: value?.excerpt?.html,
              }}
            />
          </div>
        </div>

        <div>
          <h3>Frontmatter</h3>

          {JSON.stringify(value?.frontmatter)}
        </div>
        <div>
          <h4>Raw</h4>
          <pre
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: value?.excerpt?.text,
            }}
          />
        </div>
        <table>
          <tr>
            <td></td>
            <td></td>
            <td>Reading time</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td>{value?.readingTime}</td>
          </tr>
        </table>
      </div>
    </div>
  );
}
