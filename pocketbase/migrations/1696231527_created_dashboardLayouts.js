/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "fmmg17gaczivwet",
    "created": "2023-10-02 07:25:27.727Z",
    "updated": "2023-10-02 07:25:27.727Z",
    "name": "dashboardLayouts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "82iviveq",
        "name": "layout",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("fmmg17gaczivwet");

  return dao.deleteCollection(collection);
})
