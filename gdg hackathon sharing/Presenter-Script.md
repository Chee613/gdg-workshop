# Re:Zero Beginner series — Presenter script

For the current 16-slide Hackathon Masterclass & Hackathon Project Sharing deck. Written in conversational English for a student audience. Use the spoken passages naturally; stage directions in **bold brackets** are for the presenter.

There is no fixed length for the talk. The challenge itself uses the existing five-minute timer. Finish a point when the audience understands it, rather than continuing just because more script remains. Optional expansions are there for a curious room.

## Before people arrive

- Open the slides in the browser and check that the projector shows the audience view. Use ← and → to move backward and forward. On the Brainstorm, Demo and Pitch slides, the first forward press reveals the content. On Good UI, the first forward press stamps the Good Slide badge. Press again to continue.
- Gallery buttons or touch swiping change bad-design examples. Click a screenshot to enlarge it; Escape closes the image. Arrow keys leave an open popup alone.
- Click the presentation background before using N for the existing short speaker notes or F for full screen. The full rehearsal script is this document; keep it on the presenter display.
- Test the deployed challenge QR from a phone. Confirm the theme, five criteria and Gemini connection in the private host dashboard. Start a clean round before the real activity. Keep the private dashboard off the projector.
- Open **Phone Demo - scrcpy**, approve USB debugging if asked, and prepare the apps in demo order. Silence phone notifications. After a phone demo, return focus to the browser before using the slide arrows.
- Rehearse one successful action in each project. Have the screenshots ready if a live connection or feature fails. Do not present a screenshot as proof of a live action.
- Choose one true story behind the event photos. Use what actually happened; no invented judge comments, user numbers or results.

## 1 — Cover · Re:Zero Beginner series

**[Let the animated dinosaur establish the mood. Look at the audience before starting.]**

“Hi everyone! Welcome to Re:Zero Beginner series: Hackathon Masterclass & Hackathon Project Sharing.

“Quick show of hands: who has joined a hackathon before? Keep your hand up if, at some point, you had absolutely no idea what your team was doing.”

**[Raise your own hand only if true. Let the room react.]**

“And who hasn’t joined because you thought you weren’t good enough at coding yet?

“That’s one of the things we’re going to unpack. Today we’ll look at finding an idea, building something useful, showing it clearly, and pitching it so another person actually cares.

“We’ll show real projects, look at some design mistakes, and then you’ll try coming up with an idea yourself. The dinosaur gets to relax for now. You’ll have a small challenge later.”

**Transition:** “Before we start, let’s give your questions somewhere to live.”

## 2 — Opening Slido Q&A

“Scan this code and keep the Slido page open. Whenever a question comes up, put it there—even if it feels basic.

“Questions like ‘Where do I start?’, ‘How do I find teammates?’ or ‘What if my demo fails?’ are all welcome. You can also upvote a question someone else has already asked.

“For a quick warm-up, what worries you most about a hackathon: finding an idea, building it, or presenting it? You can say it out loud or put it in Slido.”

**[Take two or three responses. Refer back to one later so the audience knows you listened. Wait until people have had a real chance to scan.]**

**Transition:** “Let’s introduce the people behind the projects.”

## 3 — Meet the builders

“You’ll hear from Zayn, our nine-time hackathon winner; Shawn, the GDG AI/ML Team Lead; and Edmund—who has also brought strong birthday-cake energy to this presentation.”

**[Acknowledge Edmund without guessing his age. If appropriate, let the room give him a quick birthday cheer.]**

“We each bring a different perspective: finding a useful problem, making the technology work, and communicating the result. You don’t need to be the strongest person at every one of those things. You do need a team that can connect them.

“As you look at the projects today, try to notice which part interests you most. That can be your starting contribution to a team.”

**[If several speakers are present, each adds their name and one sentence about their actual contribution. Avoid three long biographies.]**

**Transition:** “Here’s a little context for where these lessons came from.”

## 4 — Hackathon · Teams. Prototypes. Demos.

“There are a lot of smiles and trophies in these photos. What a photo doesn’t show is the unfinished feature, the last-minute decision, or the part of the demo that everyone was quietly worried about.

“The experience behind this slide adds up to eleven hackathons and nine wins. The useful thing to take from that is the pattern of learning, rather than a formula that guarantees a trophy.

“Look at the different things here: people, prototypes and presentations. A hackathon brings all three together. A strong idea still needs something you can show. A working prototype still needs a story people can follow.”

**[Tell ONE true story from a photo: what the team tried, what went wrong or surprised you, what you changed, and the actual result. Keep the lesson clear. If no story is prepared, use the passage above and move on.]**

“If you remember one thing from that experience, remember this: make the useful part easy for someone else to understand.”

**Transition:** “And that starts before you open your code editor.”

## 5 — Hackathon tips → Idea Brainstorming

**[Begin on the centred Hackathon tips title. Press → once to reveal the meme.]**

“Be honest: who would start by asking ChatGPT for ten winning hackathon ideas?”

**[Give the room space to laugh or raise hands.]**

“You can use AI. The risk is letting it choose a problem that you don’t understand—and then building something that sounds impressive but matters to nobody you can name.

“The Drake meme is a reminder to bring your own observation first. What annoyed you this week? What did your housemates have to remind each other about again? What is inconvenient for someone whose needs usually get overlooked?

“Then AI becomes more useful. Ask it to challenge your assumptions, identify alternatives, help research the problem, or speed up a prototype. Keep responsibility for the idea with the team.”

**[Point to the checklist.]**

“Brainstorm. Start with daily life. Find a specific problem.

“Turn to the person next to you. Share one small inconvenience you’ve had recently. Describe the problem first—don’t pitch an app yet.”

**[Let a few pairs exchange ideas, then ask for two examples.]**

“Notice how much easier it is to ask useful questions once there’s a real situation. Who experiences it? How often? What do they do now?”

**Optional expansion:** “Pick one audience example. Ask what the current workaround is, what it costs in time or effort, and whether AI would improve it. If a simpler approach solves it, acknowledge that.”

**Transition:** “Now we need to turn that problem into a buildable idea.”

## 6 — Simple wins

“A common beginner move is to add everything: a chatbot, a dashboard, recommendations, analytics, maybe a marketplace—because each feature makes the idea sound bigger.

“Let’s try the reverse. Finish this sentence: ‘Our project helps this person do this useful thing.’

“For example: ‘It helps housemates know whose turn it is to take out the rubbish.’ You can understand that immediately. Now we can ask whether reminders, a shared schedule or some other tool would help.

“Beyond a chatbot doesn’t mean chat interfaces are bad. It means ask what useful outcome happens after the conversation. Did the person complete a task? Did something become easier to access? Did the system detect something and help them respond?”

**[Point to the electronics and enclosure images.]**

“Sometimes that involves machine learning or AI plus connected hardware. Sometimes it’s a simple app. Pick the technology because the problem needs it.

“Could an old phone be useful as part of a new device? That’s worth exploring. But we’d still need to check what it can reliably do, who would use it, and whether the reuse actually creates a benefit.”

**Audience prompt:** “For the inconvenience you just discussed, what’s the smallest useful result you could demonstrate?”

**Transition:** “Once that result is clear, we can make it real.”

## 7 — Make it real · Build. Test. Improve.

“Here we can look beyond the outside of the prototype and see what’s inside.

“A polished enclosure tells one part of the story. The electronics, connections and working behaviour tell another. You need to know which part is real, which part is still a prototype, and which part you’re proposing for later.”

**[Point to the images as you move through the sequence.]**

“Build one complete path through the project. Give it an input, let the system do its job, and show the result. Then test that path on something realistic—not just the one example you’ve seen twenty times already.

“If it fails, that’s useful information. Maybe the input is unclear. Maybe the connection is unstable. Maybe the user doesn’t understand what to do next. Improve the part that matters most to the experience.”

**Audience prompt:** “If I unplug the internet during your demo, what still works? And what’s your honest backup?”

“A recording or screenshot can help explain a failure, as long as you clearly say what it is. Don’t spend the whole pitch repeatedly pressing a button and hoping it becomes a different button.”

**Optional expansion:** Have the builder explain one real constraint of this prototype and the actual change it led to. Keep technical depth tied to a user-visible result.

**Transition:** “Let’s look at that through actual projects.”

## 8 — Project Showcase · live demos

**[Keep the divider visible while introducing the demos. Switch to scrcpy or the relevant app. The exact actions below should be rehearsed against the installed versions.]**

“As we show each project, I want you to watch for three things: who it helps, what the person does, and what useful result they get.

“You don’t need to understand every line of code to judge whether that story makes sense.”

### Demo A — ReWatt

“First, ReWatt. On this screen, you can see a room view with temperature, humidity, occupancy and a live camera area.

“Before I press anything, what would you want to know first if this were your room?”

**[Take one answer. Point to the matching information, if present. Demonstrate one verified action or real update. Describe its actual result. If showing sample data, say so.]**

“The question for a room-monitoring interface is whether the information helps someone decide what to do. Showing another number isn’t automatically useful. We need a reason for it to be there.”

### Demo B — Housemate dashboard

“Now compare that with the housemate app. This screen tells me who’s on duty and gives me a view of household expenses.

“Think about the number of group-chat messages that start with ‘Whose turn is it?’ The product needs to make that answer easy to find.”

**[Show the duty assignment and one rehearsed household task, if available. Keep the focus on the task rather than touring every tab.]**

“The character and colours give it personality. The useful test is whether I can still find the responsibility and the next action quickly.”

### Demo C — Sign-to-voice interface

“This next interface is for sign-to-voice interaction. Notice the camera area, the recognition state and the translation controls.

“Here, feedback matters. The person needs to know whether the app is waiting, recognising input, or ready to show a result.”

**[Use a supported, rehearsed example. State the actual supported scope. If it misrecognises something, explain that limitation rather than suggesting that it supports every sign language or user.]**

“Accessibility projects need testing with the people they’re intended to help. A successful example is a starting point; it doesn’t establish reliability across different people or conditions.”

**[Return to the browser and click the slide background to restore keyboard focus.]**

“Which project’s purpose was easiest to understand? What made it clear?”

**Transition:** “That leads into how we present information on a screen.”

## 9 — UI / Slide Design · bad examples

**[Press → once to reveal the first pair. Let people look before explaining.]**

“Imagine I put this on a projector and say, ‘As you can clearly see…’ Can you clearly see?”

**[Let the room react.]**

“Tell me where your eyes go first. What is the main point? What would you do next?

“There may be useful information here. The problem in a live presentation is how much work the audience has to do to find it. Small text and many competing elements can make that difficult.”

**[Click Next examples to show the second pair. Use the gallery buttons here; keyboard arrows change the slide.]**

“And a dashboard used by someone at their desk has a different job from a slide shown briefly on stage. A screen can be appropriate for one context and still be hard to present in another.

“Let’s improve one thing. What would you enlarge, remove or emphasise first?”

**[Take two answers. If useful, enlarge one screenshot, discuss a specific detail, then Escape to return.]**

“The goal is to help a person understand the important information. Start there before choosing another colour or animation.”

**Transition:** “Now let’s look at examples with a clearer sense of purpose.”

## 10 — UI / Slide Design · good examples

“Here are the three interfaces we just discussed. Different visual styles, different tasks—but we can still look for the same things: hierarchy, readable information, useful feedback and an obvious next step.

“In ReWatt, look at how the room information is grouped. In the housemate app, look at the duty and expense areas. In the sign-to-voice app, look at the camera, state and primary control.

“Which part helps you understand what the product is for? And is there anything you would still improve?”

**[Take one response. Click anywhere, or press →, to stamp the badge.]**

“There we go. Good Slide, certified by this extremely serious certification system we made for our own slide.”

**[Let the joke land. This is a workshop gag, not an actual external certification.]**

“The useful part is the reasoning behind the design. A badge can’t replace testing it with someone who hasn’t seen it before.”

**[After stamping, a screenshot click enlarges it. Escape closes it. Press → again to move on.]**

**Transition:** “A clear screen helps. Your delivery has to help too.”

## 11 — if (Pitch || Presentation_Video)

**[Begin with the code title. Press → once to reveal the pace memes.]**

“Let me demonstrate two bugs in presentation delivery.”

**[Deliver the next sentence deliberately slowly, only long enough to make the point.]**

“‘Our… project… is… designed… to… help… people…’

“That’s the first meme.”

**[Point to Too Slow. Then deliver one sentence quickly, with no pauses.]**

“‘WehaveanAIpoweredplatformwithrealtimemonitoringandautomatedinsightsand…’

“That’s the second meme. You heard words, but it was hard to build a picture of the idea.”

**[Return to your natural pace.]**

“Try this instead: ‘Our project helps residents understand what is happening in their room. Here’s the information they see. Here’s the action they can take.’

“Give people a moment to follow a new idea or look at a demo. You can speak with energy without racing. You can pause without losing momentum.

“The same applies to a presentation video. Someone watching it for the first time doesn’t have the background knowledge your team has.”

**Audience prompt:** “Explain your idea to your neighbour in one sentence. Then ask them to explain it back. Where did the meaning change?”

**Transition:** “Once they can follow you, give the pitch a structure.”

## 12 — Pitch for the points

**[Trace the five stages from top to bottom.]**

“Here’s a structure you can rehearse: Problem, Agitation, Solution, Validation Proof, and one memorable value metric.

“Start with the problem. Who experiences it, and what happens today?

“Agitation means explaining why it matters. What time, effort, money or opportunity is being lost? Keep that consequence truthful. You don’t need to make a small inconvenience sound like the end of civilisation.

“Then show the solution. One clear action is often easier to understand than a long list of features.

“Next, validation. What have you actually tested? A working demo? A conversation with an intended user? A measured result? Tell us what the evidence supports and what you still don’t know.

“Finally, the value metric. The slide calls it ‘Insane Value Metric’, but please keep the measurement sane. A modest result you can explain is stronger than a huge number with no basis.”

**[Use this clearly labelled fictional example.]**

“Imagine a household throws away food because nobody remembers what is about to expire. The consequence is wasted food and repeated spending. The proposed solution is a shared pantry assistant that suggests meals using available ingredients. Validation would mean testing whether people use it and whether it helps. A value metric might be a measured change in the food they discard—we can’t claim that improvement before measuring it.”

“Now connect that story to the actual judging criteria. Explain the impact, what’s different, whether it can work, how it fits the theme, and how its value could grow. Don’t hide the strongest evidence in a tiny final slide.”

**Optional exercise:** Ask a volunteer for their problem and solution. Invite the room to suggest a validation test and a measurable outcome. Call these proposed tests, not achieved results.

**Transition:** “Your turn to put that into practice.”

## 13 — AI for Everyday Life · challenge announcement

“Our theme is AI for Everyday Life.

“Choose a specific everyday problem and propose a useful way to address it. It could involve a person, a household, a community or the environment. A small, well-explained idea is welcome.

“Scan this QR code. You only need a project title and a brief introduction, up to two hundred words. You don’t need to fill the limit.

“Tell us who you’re helping, the problem, how your idea would work, and the benefit you would test. If AI is involved, make its contribution clear.”

**[Keep the QR visible until people can open the form.]**

“The judging weights are: impact and sustainability, twenty-five percent; innovation, twenty; feasibility, twenty; theme relevance, fifteen; and lasting or scalable value, twenty.

“That means ‘it uses AI’ is the beginning of the explanation, rather than the whole explanation. Think about whether someone could use it and why it would help.

“We’ll use AI to score the submissions against the same rubric. The shortlist gives us something to discuss; it isn’t a guarantee that an idea will succeed in the real world.

“Your title appears on the public board. Your introduction is available to the host and used for judging. You can update your submission while the round is open.”

**[Do not press Reveal rankings yet. Optional: open the public dashboard to show titles arriving, then use browser Back to return. Keep /host on the presenter display only.]**

“Ready? Let’s give the dinosaur five minutes to get to the other side.”

**Transition:** Press → to the clock.

## 14 — GDG Clock · five-minute activity

**[Press Start. The dinosaur progresses across the track over the same five minutes.]**

“You have five minutes for this activity. Start with a real problem, choose the smallest useful solution, then submit your title and introduction.

“If you’re stuck, ask yourself: what did I repeat, forget, waste or struggle to access this week?”

**[Stop narrating continuously. Walk around, listen, and help people sharpen the problem rather than supplying their idea. Ask: ‘Who is this for?’, ‘What do they do now?’, ‘What would the first version do?’]**

**If needed, a mid-activity prompt:** “If your introduction is becoming a list of features, come back to the one useful outcome.”

**When roughly a minute remains:** “Finish your title and introduction, and submit. It’s fine if you still have questions to test.”

**At zero:** “Let’s make sure the final submissions have arrived. Thank you—look at how many different problems we found just by starting with daily life.”

### Return to the challenge for the reveal

**[Press ← to return to Challenge. If you need to show arriving titles, use the public dashboard and return to the slides afterwards. Check the actual submission count. At least three submissions and a working Gemini connection are required.]**

“We’re going to see the AI shortlist now. While it works, think about which idea you would most want to ask a follow-up question about.”

**[Press Reveal rankings once. Let the judging and podium sequence finish. Do not project the private host dashboard.]**

“Congratulations to our top three! Let’s hear from one of you: who would use this, and what would you test first?”

**[Invite a short explanation from one or more authors. Ask the audience what evidence would make an idea more convincing. Acknowledge interesting ideas beyond the podium; the host dashboard has the full ranking.]**

“The score gives us feedback on a short proposal. The next step is to learn whether the problem and solution hold up with real users.”

**If judging is unavailable:** “The ranking service isn’t responding, so we’ll discuss the ideas directly. Let’s hear a few proposals and use the same criteria to ask useful questions.” **[Do not invent AI scores or announce a fabricated winner.]**

**[Close the rankings popup. Use the direct navigation pill labelled Questions to reach closing Slido without revisiting the timer.]**

## 15 — Closing Slido Q&A

“Let’s come back to your questions. You can scan the same Slido code again if you need it.

“At the beginning, we heard concerns about ideas, building and presenting. Which part feels clearer now? What would still stop you from trying your first hackathon?”

**[Answer the highest-voted relevant questions. Read each question aloud before answering. Invite the speaker with the right experience to respond. Separate personal experience from a general recommendation.]**

**If the room is quiet:** “What’s one thing you would do differently after today? Or what part of a hackathon still feels intimidating?”

**Optional prompts for discussion:**

- “How do I choose what to cut when the build is too large?” → Return to the smallest useful end-to-end demo.
- “Can I use AI tools?” → Discuss the event’s actual rules, your responsibility to understand the work, and honest attribution where required. Do not assume every event has the same policy.
- “What if the demo fails?” → Explain what worked, show a clearly labelled backup, and describe the limitation without pretending it succeeded live.
- “What makes an idea different?” → Compare it with current workarounds and existing approaches, then identify a meaningful improvement for a specific user.

**Transition:** “Before you go, two quick scans.”

## 16 — Thank You · attendance and feedback

“Thank you, everyone! Please scan the Attendance Form on the left, and the Feedback Form on the right. They are two different forms.

“For feedback, tell us what helped and what you’d like us to explain or demonstrate better next time. That helps us improve the next session.”

**[Leave the slide visible long enough for both codes. Let the cat and trophy dinosaur have their moment.]**

“My last challenge for you: keep one everyday problem from today. Talk to someone who experiences it, build the smallest useful version, and learn from what happens.

“You don’t have to arrive at your first hackathon knowing everything. Bring curiosity, contribute to your team, and make something you can explain honestly.

“Thanks again—and good luck with your next build!”

## Keeping attention while you deliver

- Ask a specific question, then leave enough silence for an answer. Respond to what someone actually says before returning to the script.
- After explaining an idea, show an example or let the room apply it. Avoid several uninterrupted explanations in a row.
- During demos, state the task before acting. Stop once the result is clear; open extra features only when they answer a useful question.
- Let each meme or animation land, then reconnect it to the lesson. Avoid talking over the punchline.
- If attention drops, shorten the next optional explanation and give the audience a concrete task. If they are engaged, use an optional expansion.
- Keep the last sentence of each section pointed toward the next slide. Rehearse the transitions as carefully as the opening.
