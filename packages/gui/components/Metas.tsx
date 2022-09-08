// NOTE: Work in progress

import validator from '@rjsf/validator-ajv6';
import Form from '@rjsf/core';

// const schema = {
//   title: 'Todo',
//   type: 'object',
//   required: ['title'],
//   properties: {
//     title: { type: 'string', title: 'Title', default: 'A new task' },
//     done: { type: 'boolean', title: 'Done?', default: false },
//   },
// };

export default function Meta({ value, schema, errors }) {
  const log = (type) => console.log.bind(console, type);

  return (
    <div>
      <br />
      <br />
      <h1>Frontmatter</h1>
      {JSON.stringify(schema)}
      <hr />
      {JSON.stringify(value?.frontmatter?.legalReferences)}
      <hr />
      {JSON.stringify({ errors })}
      ss
      {schema?.properties &&
        value?.frontmatter &&
        Object.entries(value.frontmatter).length > 1 && (
          <Form
            schema={schema}
            validator={validator}
            onChange={log('changed')}
            // onSubmit={log('submitted')}
            onError={log('errors')}
            readonly="true"
            formData={{
              title: value?.frontmatter.title,
              // legalReferences: value?.frontmatter?.legalReferences,
            }}
          />
        )}
      {/* <div className="meta">
        <h2>Meta</h2>
        <div>
          <h3>Excerpt</h3>
          Length: {value?.excerpt?.text?.length}
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
          <tbody>
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
          </tbody>
        </table>
      </div> */}
    </div>
  );
}
