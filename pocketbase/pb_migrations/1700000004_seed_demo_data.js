// mirrormind/pocketbase/pb_migrations/1700000004_seed_demo_data.js
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users")
  let demoUser = app.findAuthRecordByEmail("users", "demo@mirrormind.app")
  const isNewUser = !demoUser

  if (isNewUser) {
    demoUser = new Record(usersCollection)
    demoUser.set("email", "demo@mirrormind.app")
    demoUser.set("emailVisibility", true)
    demoUser.set("verified", true)
    demoUser.setPassword("MirrorMindDemo2026!")
    app.save(demoUser)
  }

  if (isNewUser) {
    const sessionsCollection = app.findCollectionByNameOrId("sessions")
    const questionsCollection = app.findCollectionByNameOrId("questions")
    const answersCollection = app.findCollectionByNameOrId("answers")

    const session = new Record(sessionsCollection)
    session.set("user_id", demoUser.id)
    session.set("title", "Senior Frontend Engineer @ Acme Corp")
    session.set("job_description",
      "We're looking for a Senior Frontend Engineer to lead our design system " +
      "work and mentor junior engineers. You'll own React component " +
      "architecture, drive performance improvements, and collaborate closely " +
      "with product and design. 5+ years of React experience required, " +
      "TypeScript and testing experience strongly preferred."
    )
    app.save(session)

    const qaPairs = [
      {
        question: "Tell me about a time you had to refactor a large, poorly-structured React codebase. What was your approach?",
        transcript: "At my last job we had a dashboard app that had grown to over 200 components with no clear folder structure. I started by mapping out the actual data flow, then grouped components by feature instead of by type. I did it incrementally over three sprints, writing tests before touching legacy code so I could refactor with confidence. We cut our average PR review time in half by the end.",
        score: 9,
        feedback: "Strong, structured answer with a clear before/after and a concrete metric. You explained both the technical approach and the incremental rollout strategy, which shows good judgment about risk.",
        tip: "Consider naming the specific tools you used (e.g. a codemod, a linter rule) to add even more technical credibility.",
      },
      {
        question: "How do you approach mentoring a junior engineer who is struggling with a task?",
        transcript: "I try to first understand whether they're stuck on the problem itself or on the tools. I'll pair with them for 20-30 minutes, ask questions instead of giving answers, and point them at relevant docs or past PRs. If they're still stuck after a day I'll step in more directly, but I want them to feel ownership over the solution.",
        score: 8,
        feedback: "Good balance between guiding and doing. The pairing approach and time-boxing show real experience mentoring, not just a textbook answer.",
        tip: "Add a specific example — naming an actual engineer and outcome (even anonymized) makes this land harder in an interview.",
      },
      {
        question: "Describe a disagreement you had with a designer or PM about a technical tradeoff. How did you resolve it?",
        transcript: "We disagreed about whether to build a custom date picker or use a library. I laid out the maintenance cost of a custom component versus accessibility gaps in the library option, and we ended up doing a short spike to test the library's accessibility before deciding. It was a good way to make the decision data-driven instead of opinion-driven.",
        score: 7,
        feedback: "Solid example of using a spike to de-risk a decision. The story would be stronger with a clearer statement of the actual outcome and what you'd do differently next time.",
        tip: "End answers like this with the final decision and result — interviewers want to know how the story actually ended.",
      },
      {
        question: "What's your approach to keeping a design system consistent as a product scales across multiple teams?",
        transcript: "Documentation and enforcement through tooling, not just docs. We used Storybook for visual documentation and ESLint rules to catch raw hex codes or off-system spacing values at PR time. Regular office hours with consuming teams helped catch drift early too.",
        score: 8,
        feedback: "Good mix of tooling and process. Mentioning ESLint enforcement specifically shows you think about scaling consistency without relying purely on discipline.",
        tip: "Mention how you handle legitimate exceptions to the system — interviewers often probe for whether you're dogmatic or pragmatic.",
      },
      {
        question: "How do you measure and improve frontend performance in a production app?",
        transcript: "I start with real user monitoring — Core Web Vitals from actual traffic, not just synthetic Lighthouse runs. Then I profile with the browser's performance tab to find actual bottlenecks, usually large bundle sizes or unnecessary re-renders. Code splitting and memoization are common fixes, but I always verify the fix against the RUM data afterward.",
        score: 9,
        feedback: "Excellent — you distinguished real-user data from synthetic testing and closed the loop by verifying fixes against production metrics. That's a senior-level answer.",
        tip: "None — this is a strong answer as-is. You could optionally mention a specific bundler tool (e.g. webpack-bundle-analyzer) for extra specificity.",
      },
    ]

    qaPairs.forEach((pair, i) => {
      const question = new Record(questionsCollection)
      question.set("session_id", session.id)
      question.set("question_text", pair.question)
      question.set("order_index", i)
      app.save(question)

      const answer = new Record(answersCollection)
      answer.set("question_id", question.id)
      answer.set("session_id", session.id)
      answer.set("transcript", pair.transcript)
      answer.set("score", pair.score)
      answer.set("feedback", pair.feedback)
      answer.set("tip", pair.tip)
      app.save(answer)
    })
  }
}, (app) => {
  const demoUser = app.findAuthRecordByEmail("users", "demo@mirrormind.app")
  if (demoUser) {
    app.delete(demoUser)
  }
})
