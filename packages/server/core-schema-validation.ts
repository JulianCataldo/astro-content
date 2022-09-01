// /* Core meta schema validation */
// let validate;
// console.log({ coreSchema });
// try {
//   const schemaForAjv = {
//     definitions: { ...state.schemas.internals, object: file.data },
//   };

//   validate = ajv.compile(schemaForAjv);
// } catch (_) {
//   return false;
// }
// if (validate) {
//   validate(file.data);
//   if (validate.errors) {
//   }
// }
export default function coreSchemaValidation(params) {}
