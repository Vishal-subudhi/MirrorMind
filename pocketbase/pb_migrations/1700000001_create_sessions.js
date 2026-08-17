// mirrormind/pocketbase/pb_migrations/1700000001_create_sessions.js
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users")

  const collection = new Collection({
    type: "base",
    name: "sessions",
    listRule: "user_id = @request.auth.id",
    viewRule: "user_id = @request.auth.id",
    createRule: "user_id = @request.auth.id",
    updateRule: "user_id = @request.auth.id",
    deleteRule: "user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: usersCollection.id,
        cascadeDelete: true,
      },
      { name: "job_description", type: "text", required: true },
      { name: "title", type: "text", required: true, max: 200 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("sessions")
  app.delete(collection)
})
