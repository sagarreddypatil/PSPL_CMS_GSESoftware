/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "16v40x7wqaqdkfn",
    "created": "2023-10-02 07:44:50.633Z",
    "updated": "2023-10-02 07:44:50.633Z",
    "name": "chartColors",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "p9bfd1xt",
        "name": "colors",
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
  const collection = dao.findCollectionByNameOrId("16v40x7wqaqdkfn");

  return dao.deleteCollection(collection);
})
