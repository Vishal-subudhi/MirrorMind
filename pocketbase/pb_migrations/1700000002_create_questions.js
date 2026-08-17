// mirrormind/pocketbase/pb_migrations/1700000002_create_questions.js
migrate((app) => {
  const sessionsCollection = app.findCollectionByNameOrId("sessions")

  const collection = new Collection({
    type: "base",
    name: "questions",
    listRule: "session_id.user_id = @request.auth.id",
    viewRule: "session_id.user_id = @request.auth.id",
    createRule: "session_id.user_id = @request.auth.id",
    updateRule: "session_id.user_id = @request.auth.id",
    deleteRule: "session_id.user_id = @request.auth.id",
    fields: [
      {
        name: "session_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: sessionsCollection.id,
        cascadeDelete: true,
      },
      { name: "question_text", type: "text", required: true },
      { name: "order_index", type: "number", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("questions")
  app.delete(collection)
})
