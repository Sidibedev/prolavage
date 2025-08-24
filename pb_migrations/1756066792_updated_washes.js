/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3664549351")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\nuser = @request.auth.id &&\n@request.auth.status = \"active\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3664549351")

  // update collection data
  unmarshal({
    "createRule": ""
  }, collection)

  return app.save(collection)
})
