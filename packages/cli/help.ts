const addHelp = `
Usage examples

pnpm content add zebras zebra
=> New entity "zebras" with the singular name of "zebra"

Note: An entity act as collection of entries or singletons
Entry have common schema, singletons have their own schemas
It's up to user to decorrelate singletons in their schema

pnpm content add zebras doody
=> Add a "zebra" entry with an unique name "doody" in "zebras" entity
`;

export { addHelp };
