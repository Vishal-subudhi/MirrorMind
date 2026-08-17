// mirrormind/pocketbase/pb_migrations/1700000003_create_answers.js
migrate((app) => {
  const questionsCollection = app.findCollectionByNameOrId("questions")
  const sessionsCollection = app.findCollectionByNameOrId("sessions")

  const collection = new Collection({
    type: "base",
    name: "answers",
    listRule: "session_id.user_id = @request.auth.id",
    viewRule: "session_id.user_id = @request.auth.id",
    createRule: "session_id.user_id = @request.auth.id",
    updateRule: "session_id.user_id = @request.auth.id",
    deleteRule: "session_id.user_id = @request.auth.id",
    fields: [
      {
        name: "question_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: questionsCollection.id,
        cascadeDelete: true,
      },
      {
        name: "session_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: sessionsCollection.id,
        cascadeDelete: true,
      },
      { name: "transcript", type: "text", required: false },
      { name: "score", type: "number", required: true },
      { name: "feedback", type: "text", required: true },
      { name: "tip", type: "text", required: true },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("answers")
  app.delete(collection)
})
