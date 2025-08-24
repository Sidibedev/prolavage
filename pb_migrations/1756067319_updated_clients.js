/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2442875294")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\nuser = @request.auth.id &&\n@request.auth.status = \"active\"",
    "updateRule": "@request.auth.id != \"\" &&\nuser = @request.auth.id &&\n@request.auth.status = \"active\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2442875294")

  // update collection data
  unmarshal({
    "createRule": "",
    "updateRule": ""
  }, collection)

  return app.save(collection)
})
