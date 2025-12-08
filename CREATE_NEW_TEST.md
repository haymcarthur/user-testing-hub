# User Test Creation Template

## Overview

This template guides Claude through creating a complete user testing application through a conversational interview process with the designer. The system automatically generates a React application, integrates it with the dashboard, and deploys it to Vercel.

---

## When to Use This Template

A designer will initiate test creation by saying something like:
- "I want to create a new user test"
- "Help me build a user test"
- "Create a new test for the dashboard"

When you see this request, **immediately enter Plan Mode** and begin the interview process using this template.

---

## Interview Process

### Important Guidelines

1. **Always use Plan Mode** for the entire interview
2. **Ask questions one phase at a time** - don't overwhelm the designer
3. **Show progress** - "Phase 1/5: Test Fundamentals"
4. **Confirm understanding** - Summarize responses before moving to next phase
5. **Be conversational** - This should feel like a collaborative design session
6. **Offer examples** - Reference the Highlights test when helpful
7. **Validate responses** - Ensure test ID is kebab-case, task count is reasonable, etc.

---

## Phase 1: Test Fundamentals

**Introduction to Phase:**
"Let's start by understanding the basics of your user test. I'll ask you 5 questions about the test's purpose and scope."

### Question 1: Test Name & ID
**Ask:** "What would you like to call this test? Please provide both:
- A display name (e.g., 'Birth Record Highlights')
- A test ID in kebab-case (e.g., 'highlights')"

**Validation:**
- Test ID must be kebab-case (lowercase, hyphens only)
- Test ID must be unique (check Dashboard.jsx for existing IDs)
- Display name should be clear and descriptive

**Store:**
- `testName` (display name)
- `testId` (kebab-case ID)

### Question 2: Test Objective
**Ask:** "What is the primary objective of this test? What research question are you trying to answer?"

**Guidance:** "Be specific about what you want to learn. For example:
- 'Compare which highlighting method is fastest and most preferred'
- 'Test if users can successfully navigate to the family tree'
- 'Evaluate the usability of the new search interface'"

**Store:**
- `objective` (full description)

### Question 3: Number of Tasks
**Ask:** "How many tasks will participants complete in this test?"

**Guidance:**
- Most tests have 1-5 tasks
- Each task should test a specific interaction or method
- For A/B/C testing, you might have 3 tasks (one per method)
- For single-method testing, you might have 1-2 tasks

**Validation:**
- Must be a number between 1 and 10

**Store:**
- `taskCount` (number)

### Question 4: Brief Description
**Ask:** "Please provide a brief 1-2 sentence description of this test (this will appear on the dashboard)."

**Store:**
- `description` (brief summary)

### Question 5: Expected Participants
**Ask:** "How many participants are you expecting to test with?"

**Guidance:** "This is just for planning purposes - the system will track actual participants automatically."

**Store:**
- `expectedParticipants` (number)

**Phase 1 Summary:**
After collecting all answers, summarize:
"Great! Here's what we have so far:
- Test: [testName] (ID: [testId])
- Objective: [objective]
- Tasks: [taskCount]
- Description: [description]
- Expected participants: [expectedParticipants]

Ready to move to Phase 2?"

---

## Phase 2: Task Definition

**Introduction to Phase:**
"Now let's define each task in detail. For each task, I'll ask about the interface, components needed, and success criteria."

**Repeat for each task (1 to taskCount):**

### Question 1: Task Description
**Ask:** "Task [N]: What will the user be asked to do in this task?"

**Guidance:** "Be specific about the user's goal. For example:
- 'Highlight all required fields on the birth record using the red highlighting method'
- 'Navigate to John Smith's profile using the new navigation menu'
- 'Search for birth records in California between 1920-1930'"

**Store:**
- `tasks[N].description`

### Question 2: UI Components Needed
**Ask:** "What UI components from the ux-zion-library will this task need?"

**Provide Component Reference:**
"Here are the available components:

**Image/Document Viewing:**
- ImageViewer - View and interact with images
- RibbonViewer - Filmstrip-style image navigation
- ImageGrid - Grid layout for multiple images
- AdjustImage - Image adjustment controls (brightness, contrast, etc.)
- ZoomControl - Zoom and pan controls

**Forms:**
- TextField - Text input fields
- TextArea - Multi-line text input
- Select - Dropdown selection
- Checkbox - Single or multiple checkboxes
- Radio - Radio button groups
- Toggle - Toggle switches
- Slider - Range sliders

**Buttons:**
- Button - Standard buttons (high/medium/low emphasis)
- IconButton - Icon-only buttons
- BillboardButton - Large promotional buttons

**Navigation:**
- Breadcrumb - Breadcrumb navigation
- TabGroup & Tab - Tabbed interfaces
- MenuOverlay - Dropdown menus

**Overlays:**
- DialogOverlay - Modal dialogs
- FullPageOverlay - Full-screen overlays
- MenuOverlay - Context menus
- TooltipOverlay - Tooltips
- QuickGlanceOverlay - Hover previews
- StatusOverlay - Status messages

**Display:**
- Card - Content cards
- ImageCard - Image-focused cards
- ListItem - List items with icons/actions
- DataTable - Sortable data tables
- DataBlock - Label/value pairs
- HeadingBlock - Section headings
- InfoSheet - Information panels
- Alert - Alert messages
- Avatar - User avatars
- Divider - Visual separators

**Icons:**
- 300+ icons from Zion design system (Activity, Content, Control, Document, Event, Help, Media, Menu, Notice, Person, Place, Social, Thing, Tree categories)"

**Store:**
- `tasks[N].components[]` (array of component names)

### Question 3: Custom Interactions
**Ask:** "Does this task require any custom interactions beyond the standard component behavior?"

**Examples:**
- "User needs to click and drag to highlight text"
- "User needs to attach highlights to specific fields on a form"
- "User needs to reorder items in a list"
- "User needs to draw on an image"

**Store:**
- `tasks[N].customInteractions` (description or null)

### Question 4: Success Criteria
**Ask:** "How will we determine if the user successfully completed this task?"

**Provide Options:**
"Choose one or more types of validation:

1. **Self-reported only** - Just ask the user if they succeeded (no automated validation)

2. **Completion-based** - Check if user completed specific actions:
   - Clicked a specific button
   - Filled out required fields
   - Created a certain number of items (e.g., 3 highlights)

3. **Accuracy-based** - Check if user did it correctly:
   - Selected the correct answer from options
   - Highlighted the correct fields
   - Found the correct person

4. **Custom validation logic** - Describe your own success criteria and I'll write the validation code"

**Store:**
- `tasks[N].validationType` (self-reported | completion | accuracy | custom)
- `tasks[N].validationCriteria` (detailed description of what counts as success)

### Question 5: Task-Specific Data
**Ask:** "Will this task need any specific data, images, or content?"

**Examples:**
- "A birth record image with specific fields to highlight"
- "A family tree structure with sample people"
- "A list of search results to filter"

**Guidance:** "You can provide:
- Image URLs or file paths
- JSON data structures
- Text content
- Or describe what's needed and I'll help structure it"

**Store:**
- `tasks[N].requiredData` (description, URLs, or data structures)

**Task Summary:**
After each task, summarize:
"Task [N] Summary:
- Description: [description]
- Components: [components list]
- Custom interactions: [customInteractions]
- Success validation: [validationType]
- Criteria: [validationCriteria]
- Required data: [requiredData]

Looks good?"

**Phase 2 Summary:**
After all tasks defined:
"Perfect! We've defined all [taskCount] tasks. Ready for Phase 3 where we'll set up your custom metrics and questions?"

---

## Phase 3: Data Collection

**Introduction to Phase:**
"Now let's configure what data you'll collect from participants. All tests automatically include:
- Time on task (tracked automatically)
- Self-reported success ('Did you complete the task successfully?')
- Difficulty rating ('Overall, this task was: 1-5 scale')
- Screen recording (with consent)

Let's add any custom metrics you need."

### Question 1: Preference Comparison
**Ask:** "Are you comparing multiple methods or approaches (like A/B/C testing)?"

**If YES, ask:**
"What are you comparing? (e.g., 'Three different highlighting methods')"

**Store:**
- `hasPreferenceComparison` (boolean)
- `preferenceQuestion` (e.g., "Which highlighting method did you prefer?")
- `preferenceOptions[]` (e.g., ["Red Method", "Blue Method", "Green Method"])

**If NO, skip to Question 2**

### Question 2: Likert Scale Ratings
**Ask:** "Would you like participants to rate any aspects of the experience on a 1-5 scale?"

**Examples:**
- Ease of use
- Visual clarity
- Confidence in results
- Speed/efficiency
- Intuitiveness

**If YES, ask:**
"What aspects should they rate? (List each one)"

**Store:**
- `likertScales[]` - Array of objects with:
  - `question` (e.g., "The highlighting tool was easy to use")
  - `lowLabel` (e.g., "Strongly Disagree")
  - `highLabel` (e.g., "Strongly Agree")

### Question 3: Open-Ended Feedback
**Ask:** "Would you like to collect any open-ended text feedback?"

**If YES, ask:**
"What questions do you want to ask? (You can have multiple)"

**Examples:**
- "What did you find most confusing?"
- "What did you like best about this method?"
- "How would you improve this experience?"

**Store:**
- `openEndedQuestions[]` - Array of question strings

### Question 4: Multiple Choice Questions
**Ask:** "Do you have any multiple choice questions?"

**If YES, ask:**
"What's the question and what are the answer options?"

**Example:**
Question: "How often do you use FamilySearch?"
Options: "Daily", "Weekly", "Monthly", "Rarely", "First time"

**Store:**
- `multipleChoiceQuestions[]` - Array of objects with:
  - `question` (string)
  - `options[]` (array of strings)

### Question 5: Custom Metrics
**Ask:** "Are there any other specific data points you want to collect that we haven't covered?"

**Store:**
- `customMetrics` (description or null)

**Phase 3 Summary:**
"Data collection configured:
- Baseline: Time, success, difficulty ✓
- Preference comparison: [yes/no]
- Likert scales: [count] questions
- Open-ended: [count] questions
- Multiple choice: [count] questions
- Custom metrics: [description or 'none']

Ready for Phase 4?"

---

## Phase 4: Survey Questions

**Introduction to Phase:**
"After participants complete all tasks, they'll see a final survey. What questions do you want to ask?"

**Guidance:**
"This is where you collect overall impressions, final preferences, or demographic information."

### Question 1: Survey Questions
**Ask:** "What questions should be in the final survey?"

**Provide Structure:**
"For each question, specify:
1. Question text
2. Type (text area, multiple choice, Likert scale, etc.)
3. Options (if multiple choice)

You can reuse the preference comparison question here if applicable."

**Store:**
- `surveyQuestions[]` - Array of objects with:
  - `question` (string)
  - `type` (textarea | multiple_choice | likert | preference)
  - `options[]` (for multiple choice)
  - `required` (boolean)

**Phase 4 Summary:**
"Final survey configured with [count] questions. Ready for Phase 5?"

---

## Phase 5: Technical Setup

**Introduction to Phase:**
"Almost done! Just a couple of technical details."

### Question 1: Screen Recording Consent
**Ask:** "What message do you want to show participants when requesting screen recording permission?"

**Provide Default:**
"Default message:
'This test includes screen recording to help us understand your experience. The recording will only be used for research purposes and will not be shared publicly. Would you like to allow screen recording?'

Would you like to use the default or provide a custom message?"

**Store:**
- `recordingConsentMessage` (string)

### Question 2: Test Round
**Ask:** "This is test round 1 for this project, correct?"

**Explanation:** "Test rounds let you run the same test multiple times (e.g., before and after a change). Most new tests start at round 1."

**Store:**
- `testRound` (number, default: 1)

### Question 3: Confirmation
**Ask:** "Perfect! I have everything I need to build your test. Here's a summary of what I'll create:

**Test Details:**
- Name: [testName]
- ID: [testId]
- Tasks: [taskCount]
- Validation: [summary of validation types]

**What I'll Build:**
1. New React application in `/User Tests/[testId]`
2. [taskCount] task components using [list of Zion components]
3. Custom validation logic for success tracking
4. Task questions with [count] custom metrics
5. Final survey with [count] questions
6. Screen recording integration
7. Dashboard integration (status: planning)
8. Automatic deployment to Vercel

**What You'll Get:**
- Complete working test application
- Integrated with your dashboard
- Deployed and ready to test
- URL added to dashboard

Shall I proceed?"

**Phase 5 Summary:**
"Great! Exiting plan mode now and building your test..."

---

## Code Generation Templates

After interview complete, generate the following files:

### Directory Structure

```
/Users/haymcarthur/User Tests/[testId]/
├── src/
│   ├── components/
│   │   ├── StartScreen.jsx
│   │   ├── Task1.jsx (... TaskN.jsx)
│   │   ├── TaskQuestions.jsx
│   │   └── SurveyQuestions.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── validation.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── README.md
```

### File Template: StartScreen.jsx

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../ux-zion-library/src/components/Button';
import { Checkbox } from '../../../ux-zion-library/src/components/Checkbox';
import { Alert } from '../../../ux-zion-library/src/components/Alert';

export const StartScreen = ({ onStart }) => {
  const [recordingConsent, setRecordingConsent] = useState(false);

  const handleStart = async () => {
    let recording = null;

    if (recordingConsent) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true
        });
        recording = new MediaRecorder(stream, { mimeType: 'video/webm' });
      } catch (error) {
        console.error('Screen recording permission denied:', error);
      }
    }

    onStart(recording);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          {[testName]}
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          {[objective]}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium text-blue-900 mb-2">
            What to expect:
          </h2>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Complete {[taskCount]} task{[taskCount > 1 ? 's' : '']}</li>
            <li>Answer brief questions after each task</li>
            <li>Complete a short final survey</li>
            <li>Expected time: {[estimatedMinutes]} minutes</li>
          </ul>
        </div>

        <div className="mb-6">
          <Checkbox
            checked={recordingConsent}
            onChange={(e) => setRecordingConsent(e.target.checked)}
            label="Allow screen recording (optional)"
          />
          <p className="text-sm text-gray-600 mt-2 ml-6">
            {[recordingConsentMessage]}
          </p>
        </div>

        <Button
          emphasis="high"
          onClick={handleStart}
          className="w-full"
        >
          Begin Test
        </Button>
      </div>
    </div>
  );
};

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired
};
```

### File Template: TaskN.jsx

```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../ux-zion-library/src/components/Button';
// Import components based on tasks[N].components[]

export const Task{[N]} = ({ onComplete, onTimeUpdate }) => {
  const [startTime] = useState(Date.now());

  // Component state based on task requirements
  // [Generate state variables based on task.customInteractions]

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onTimeUpdate(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const handleComplete = () => {
    // Collect task data
    const taskData = {
      // [Generate based on task.validationCriteria]
    };

    onComplete(taskData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Task {[N]}: {[tasks[N].description]}
        </h2>
      </div>

      {/* Main content area */}
      <div className="p-6">
        {/* [Generate component usage based on tasks[N].components] */}
        {/* [Generate custom interaction handlers based on tasks[N].customInteractions] */}
      </div>

      {/* Complete button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <Button
          emphasis="high"
          onClick={handleComplete}
        >
          Complete Task
        </Button>
      </div>
    </div>
  );
};

Task{[N]}.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func.isRequired
};
```

### File Template: TaskQuestions.jsx

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../ux-zion-library/src/components/Button';
import { Radio } from '../../../ux-zion-library/src/components/Radio';
import { TextArea } from '../../../ux-zion-library/src/components/TextArea';

export const TaskQuestions = ({ taskNumber, onSubmit, onBack }) => {
  const [selfReportedSuccess, setSelfReportedSuccess] = useState(null);
  const [difficultyRating, setDifficultyRating] = useState(null);
  // [Add state for custom metrics from Phase 3]

  const handleSubmit = () => {
    onSubmit({
      selfReportedSuccess,
      difficultyRating,
      // [Add custom metrics]
    });
  };

  const canSubmit = selfReportedSuccess !== null && difficultyRating !== null;
  // [Add validation for custom metrics]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Task {taskNumber} Questions
        </h2>

        {/* Question 1: Success */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-900 mb-3">
            Did you complete the task successfully?
          </p>
          <div className="space-y-2">
            <Radio
              name="success"
              value="yes"
              checked={selfReportedSuccess === true}
              onChange={() => setSelfReportedSuccess(true)}
              label="Yes"
            />
            <Radio
              name="success"
              value="unsure"
              checked={selfReportedSuccess === null}
              onChange={() => setSelfReportedSuccess(null)}
              label="Unsure"
            />
            <Radio
              name="success"
              value="no"
              checked={selfReportedSuccess === false}
              onChange={() => setSelfReportedSuccess(false)}
              label="No"
            />
          </div>
        </div>

        {/* Question 2: Difficulty */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-900 mb-3">
            Overall, this task was:
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setDifficultyRating(rating)}
                className={`flex-1 py-3 px-4 rounded-md border-2 transition-colors ${
                  difficultyRating === rating
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl font-semibold">{rating}</div>
                <div className="text-xs mt-1">
                  {rating === 1 ? 'Very Easy' : rating === 5 ? 'Very Hard' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* [Generate custom metric questions based on Phase 3] */}
        {/* Likert scales */}
        {/* Open-ended questions */}
        {/* Multiple choice questions */}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            emphasis="low"
            onClick={onBack}
            className="flex-1"
          >
            Go Back to Task
          </Button>
          <Button
            emphasis="high"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

TaskQuestions.propTypes = {
  taskNumber: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
```

### File Template: SurveyQuestions.jsx

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../ux-zion-library/src/components/Button';
import { TextArea } from '../../../ux-zion-library/src/components/TextArea';
// [Import components based on survey question types]

export const SurveyQuestions = ({ onSubmit }) => {
  // [Generate state based on surveyQuestions from Phase 4]

  const handleSubmit = () => {
    onSubmit({
      // [Collect all survey responses]
    });
  };

  const canSubmit = true; // [Add validation based on required fields]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Final Survey
        </h2>

        <p className="text-gray-700 mb-6">
          Thank you for completing the tasks! Please answer these final questions.
        </p>

        {/* [Generate survey questions based on Phase 4] */}
        {/* Preference comparison */}
        {/* Custom survey questions */}

        <div className="mt-8">
          <Button
            emphasis="high"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

SurveyQuestions.propTypes = {
  onSubmit: PropTypes.func.isRequired
};
```

### File Template: validation.js

```javascript
/**
 * Validation logic for [testName]
 *
 * Each task has a validation function that determines actual success
 */

// [Generate validation functions based on tasks[N].validationCriteria]

/**
 * Validate Task 1: {[tasks[0].description]}
 *
 * Success criteria:
 * {[tasks[0].validationCriteria]}
 */
export const validateTask1 = (taskData) => {
  // [Generate validation logic based on validationType and validationCriteria]

  return {
    isSuccess: boolean,
    completionPercentage: number,
    details: {} // Additional validation details
  };
};

// [Repeat for each task]

/**
 * Save validation data to database
 */
export const saveValidationData = async (sessionId, taskId, validationResult) => {
  const { saveTaskValidationData } = await import('./supabase');

  await saveTaskValidationData(sessionId, taskId, {
    isSuccess: validationResult.isSuccess,
    completionPercentage: validationResult.completionPercentage,
    details: validationResult.details,
    timestamp: new Date().toISOString()
  });
};
```

### File Template: App.jsx

```jsx
import { useState, useEffect, useRef } from 'react';
import { Providers } from '@fs/zion-ui';
import { StartScreen } from './components/StartScreen';
import { Task1 } from './components/Task1';
// [Import all task components]
import { TaskQuestions } from './components/TaskQuestions';
import { SurveyQuestions } from './components/SurveyQuestions';
import {
  createTestSession,
  saveTaskCompletion,
  saveSurveyResponses,
  completeTestSession,
  uploadRecording
} from './lib/supabase';
import { validateTask1, saveValidationData } from './lib/validation';
// [Import all validation functions]

function App() {
  const [screen, setScreen] = useState('start'); // start, task1, questions1, task2, questions2, survey, complete
  const [sessionId, setSessionId] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [currentTask, setCurrentTask] = useState(1);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [taskTimeElapsed, setTaskTimeElapsed] = useState(0);
  const [taskData, setTaskData] = useState({});

  // Get project status from URL parameter
  const params = new URLSearchParams(window.location.search);
  const projectStatus = params.get('status') || 'in progress';
  const testRound = parseInt(params.get('round') || '{[testRound]}', 10);

  // Start recording if consent given
  const handleStart = async (mediaRecorder) => {
    try {
      // Create test session
      const session = await createTestSession(testRound, '', projectStatus);
      setSessionId(session.id);

      // Start recording if available
      if (mediaRecorder) {
        setRecording(mediaRecorder);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          try {
            await uploadRecording(session.id, blob);
          } catch (error) {
            console.error('Failed to upload recording:', error);
          }
        };

        setRecordedChunks(chunks);
        mediaRecorder.start();
      }

      // Move to first task
      setScreen('task1');
      setTaskStartTime(Date.now());
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  // Handle task completion
  const handleTaskComplete = (data) => {
    setTaskData(data);
    setScreen(`questions${currentTask}`);
  };

  // Handle task questions submission
  const handleQuestionsSubmit = async (questionData) => {
    try {
      const completedAt = Date.now();
      const timeSpentSeconds = Math.floor((completedAt - taskStartTime) / 1000);

      // Validate task based on task-specific logic
      const validationFunction = {
        1: validateTask1,
        // [Map other validation functions]
      }[currentTask];

      const validationResult = validationFunction ? validationFunction(taskData) : { isSuccess: null };

      // Save task completion
      await saveTaskCompletion(sessionId, {
        taskId: `task${currentTask}`,
        selfReportedSuccess: questionData.selfReportedSuccess,
        difficultyRating: questionData.difficultyRating,
        actualSuccess: validationResult.isSuccess,
        timeSpentSeconds,
        startedAt: new Date(taskStartTime).toISOString(),
        completedAt: new Date(completedAt).toISOString()
      });

      // Save validation data if available
      if (validationFunction) {
        await saveValidationData(sessionId, `task${currentTask}`, validationResult);
      }

      // Move to next task or survey
      if (currentTask < {[taskCount]}) {
        setCurrentTask(currentTask + 1);
        setScreen(`task${currentTask + 1}`);
        setTaskStartTime(Date.now());
        setTaskData({});
      } else {
        setScreen('survey');
      }
    } catch (error) {
      console.error('Failed to save task data:', error);
      alert('Failed to save your responses. Please try again.');
    }
  };

  // Handle survey submission
  const handleSurveySubmit = async (surveyData) => {
    try {
      // Save survey responses
      await saveSurveyResponses(sessionId, surveyData);

      // Complete session
      await completeTestSession(sessionId);

      // Stop recording if active
      if (recording && recording.state === 'recording') {
        recording.stop();
      }

      setScreen('complete');
    } catch (error) {
      console.error('Failed to save survey:', error);
      alert('Failed to save your survey. Please try again.');
    }
  };

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'start':
        return <StartScreen onStart={handleStart} />;

      case 'task1':
        return <Task1 onComplete={handleTaskComplete} onTimeUpdate={setTaskTimeElapsed} />;

      // [Generate cases for all tasks]

      case 'questions1':
      case 'questions2':
      // [Generate cases for all task questions]
        return (
          <TaskQuestions
            taskNumber={currentTask}
            onSubmit={handleQuestionsSubmit}
            onBack={() => setScreen(`task${currentTask}`)}
          />
        );

      case 'survey':
        return <SurveyQuestions onSubmit={handleSurveySubmit} />;

      case 'complete':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Your responses have been recorded. You may now close this window.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Providers>
      {renderScreen()}
    </Providers>
  );
}

export default App;
```

### File Template: supabase.js

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a new test session
 */
export const createTestSession = async (testRound = {[testRound]}, presentationOrder = '', projectStatus = 'in progress') => {
  const { data, error } = await supabase
    .from('test_sessions')
    .insert([
      {
        test_id: '{[testId]}',
        started_at: new Date().toISOString(),
        project_status: projectStatus,
        test_round: testRound,
        presentation_order: presentationOrder
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Save task completion data
 */
export const saveTaskCompletion = async (sessionId, taskData) => {
  const { error } = await supabase
    .from('task_completions')
    .insert([
      {
        session_id: sessionId,
        task_id: taskData.taskId,
        self_reported_success: taskData.selfReportedSuccess,
        difficulty_rating: taskData.difficultyRating,
        actual_success: taskData.actualSuccess,
        time_spent_seconds: taskData.timeSpentSeconds,
        started_at: taskData.startedAt,
        completed_at: taskData.completedAt
      }
    ]);

  if (error) throw error;
};

/**
 * Save task validation data
 */
export const saveTaskValidationData = async (sessionId, taskId, validationData) => {
  const { error } = await supabase
    .from('task_validation_data')
    .insert([
      {
        session_id: sessionId,
        task_id: taskId,
        validation_data: validationData
      }
    ]);

  if (error) throw error;
};

/**
 * Save survey responses
 */
export const saveSurveyResponses = async (sessionId, surveyData) => {
  const { error } = await supabase
    .from('survey_responses')
    .insert([
      {
        session_id: sessionId,
        ...surveyData
      }
    ]);

  if (error) throw error;
};

/**
 * Complete test session
 */
export const completeTestSession = async (sessionId) => {
  const { error } = await supabase
    .from('test_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
};

/**
 * Upload recording to Supabase Storage
 */
export const uploadRecording = async (sessionId, blob) => {
  const fileName = `${sessionId}.webm`;

  const { error: uploadError } = await supabase.storage
    .from('recordings')
    .upload(fileName, blob);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('recordings')
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('test_sessions')
    .update({ recording_url: data.publicUrl })
    .eq('id', sessionId);

  if (updateError) throw updateError;
};
```

### File Template: package.json

```json
{
  "name": "{[testId]}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fs/zion-ui": "^14.0.1",
    "@fs/zion-icon": "^10.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "prop-types": "^15.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
```

### Other Configuration Files

Copy these from the Highlights test:
- `.env` - Supabase credentials
- `.gitignore` - Standard React gitignore
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `index.html` - HTML template
- `README.md` - Deployment instructions

---

## Dashboard Integration

### Update: user-test-hub/src/pages/Dashboard.jsx

Add to the `tests` array:

```javascript
{
  id: '{[testId]}',
  title: '{[testName]}',
  description: '{[description]}',
  status: 'planning',
  created: '{[currentMonth]} {[currentYear]}',
  participants: 0,
  url: '', // Will be added after deployment
}
```

### Update: user-test-hub/src/pages/TestDetail.jsx

Add to the `testData` object:

```javascript
'{[testId]}': {
  title: '{[testName]}',
  description: '{[description]}',
  objective: '{[objective]}',
  tasks: [
    '{[tasks[0].description]}',
    '{[tasks[1].description]}',
    // ... all tasks
  ],
  created: '{[currentMonth]} {[currentYear]}',
  status: 'planning',
  participants: 0,
  url: '', // Will be added after deployment
}
```

---

## Deployment Process

After all files generated:

### Step 1: Initialize Git Repository

```bash
cd "/Users/haymcarthur/User Tests/{[testId]}"
git init
git add -A
git commit -m "Initial commit: {[testName]} user test"
```

### Step 2: Create GitHub Repository

```bash
gh repo create {[testId]} --public --source=. --description="{[description]}"
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel --prod

# Get deployment URL
```

### Step 4: Update Dashboard with URL

Update both Dashboard.jsx and TestDetail.jsx with the Vercel URL.

Commit changes:

```bash
cd "/Users/haymcarthur/User Tests/user-test-hub"
git add src/pages/Dashboard.jsx src/pages/TestDetail.jsx
git commit -m "Add {[testName]} test to dashboard"
git push
```

### Step 5: Redeploy Dashboard

Dashboard should auto-deploy via Vercel webhook.

---

## Post-Creation Checklist

After test is created and deployed:

1. ✓ Test directory created with all files
2. ✓ Components generated based on requirements
3. ✓ Validation logic implemented
4. ✓ Dashboard integration complete
5. ✓ GitHub repository created
6. ✓ Deployed to Vercel
7. ✓ URL added to dashboard

**Next Steps for Designer:**
1. Open dashboard: https://your-dashboard-url.vercel.app
2. Find new test (status: planning)
3. Click "Launch Test"
4. Go through test yourself to validate
5. Check TestDetail page to see results
6. When ready, change status to "in progress"
7. Share test URL with participants

---

## Validation Patterns Reference

### Pattern 1: Completion-Based (Button Clicks)

```javascript
export const validateTask = (taskData) => {
  const { buttonClicked } = taskData;

  return {
    isSuccess: buttonClicked === true,
    completionPercentage: buttonClicked ? 100 : 0,
    details: { buttonClicked }
  };
};
```

### Pattern 2: Completion-Based (Minimum Count)

```javascript
export const validateTask = (taskData) => {
  const { itemsCreated } = taskData;
  const requiredCount = 3;

  return {
    isSuccess: itemsCreated >= requiredCount,
    completionPercentage: Math.min(100, (itemsCreated / requiredCount) * 100),
    details: { itemsCreated, requiredCount }
  };
};
```

### Pattern 3: Accuracy-Based (Correct Answer)

```javascript
export const validateTask = (taskData) => {
  const { selectedAnswer } = taskData;
  const correctAnswer = 'B';

  return {
    isSuccess: selectedAnswer === correctAnswer,
    completionPercentage: selectedAnswer === correctAnswer ? 100 : 0,
    details: { selectedAnswer, correctAnswer }
  };
};
```

### Pattern 4: Accuracy-Based (Multiple Fields)

```javascript
export const validateTask = (taskData) => {
  const { highlightedFields } = taskData;
  const requiredFields = ['name', 'birth_date', 'birth_place'];

  const completedFields = requiredFields.filter(field =>
    highlightedFields.includes(field)
  );

  return {
    isSuccess: completedFields.length === requiredFields.length,
    completionPercentage: (completedFields.length / requiredFields.length) * 100,
    details: {
      requiredFields,
      completedFields,
      missingFields: requiredFields.filter(f => !completedFields.includes(f))
    }
  };
};
```

### Pattern 5: Custom Validation (Complex Logic)

```javascript
export const validateTask = (taskData) => {
  const { searchQuery, resultsViewed, personSelected } = taskData;

  // Multi-step validation
  const hasSearched = searchQuery && searchQuery.length > 0;
  const hasViewedResults = resultsViewed > 0;
  const hasSelectedPerson = personSelected !== null;

  const steps = [hasSearched, hasViewedResults, hasSelectedPerson];
  const completedSteps = steps.filter(Boolean).length;

  return {
    isSuccess: completedSteps === steps.length,
    completionPercentage: (completedSteps / steps.length) * 100,
    details: {
      hasSearched,
      hasViewedResults,
      hasSelectedPerson,
      searchQuery,
      resultsViewed,
      personSelected
    }
  };
};
```

### Pattern 6: Self-Reported Only (No Validation)

```javascript
export const validateTask = (taskData) => {
  // No automated validation - rely on self-reported success
  return {
    isSuccess: null,
    completionPercentage: null,
    details: {}
  };
};
```

---

## Component Usage Examples

### Example: ImageViewer with Highlighting

```jsx
import { ImageViewer } from '../../../ux-zion-library/src/components/ImageViewer';

const [highlights, setHighlights] = useState([]);

const handleAddHighlight = (highlight) => {
  setHighlights([...highlights, {
    id: Date.now(),
    x: highlight.x,
    y: highlight.y,
    width: highlight.width,
    height: highlight.height,
    field: highlight.field // if attaching to specific field
  }]);
};

<ImageViewer
  imageUrl="/path/to/image.jpg"
  highlights={highlights}
  onAddHighlight={handleAddHighlight}
  enableHighlighting={true}
/>
```

### Example: Form with Validation

```jsx
import { TextField } from '../../../ux-zion-library/src/components/TextField';
import { Select } from '../../../ux-zion-library/src/components/Select';
import { Button } from '../../../ux-zion-library/src/components/Button';

const [formData, setFormData] = useState({
  name: '',
  birthDate: '',
  birthPlace: ''
});

<TextField
  label="Name"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  required
/>

<TextField
  label="Birth Date"
  type="date"
  value={formData.birthDate}
  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
  required
/>

<Select
  label="Birth Place"
  value={formData.birthPlace}
  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
  options={[
    { value: '', label: 'Select...' },
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    // ...
  ]}
  required
/>

<Button onClick={handleSubmit}>Submit</Button>
```

### Example: Navigation Test

```jsx
import { Breadcrumb } from '../../../ux-zion-library/src/components/Breadcrumb';
import { TabGroup, Tab } from '../../../ux-zion-library/src/components/TabGroup';

const [selectedTab, setSelectedTab] = useState('overview');
const [navigationPath, setNavigationPath] = useState([]);

const handleNavigation = (destination) => {
  setNavigationPath([...navigationPath, {
    location: destination,
    timestamp: Date.now()
  }]);
};

<Breadcrumb
  items={[
    { label: 'Home', onClick: () => handleNavigation('home') },
    { label: 'Family Tree', onClick: () => handleNavigation('tree') },
    { label: 'Person Details', active: true }
  ]}
/>

<TabGroup value={selectedTab} onChange={setSelectedTab}>
  <Tab value="overview" label="Overview" />
  <Tab value="sources" label="Sources" />
  <Tab value="timeline" label="Timeline" />
</TabGroup>
```

---

## Error Handling

### Common Issues and Solutions

**Issue: Test ID already exists**
- Check Dashboard.jsx for existing test IDs
- Suggest alternative ID

**Issue: Component not found**
- Verify component exists in ux-zion-library
- Suggest alternative component

**Issue: Validation logic unclear**
- Ask for clarification
- Offer examples
- Default to self-reported only

**Issue: Deployment fails**
- Check Vercel authentication
- Verify environment variables
- Offer manual deployment instructions

**Issue: Supabase connection fails**
- Verify .env file exists and is correct
- Check Supabase project is accessible
- Verify tables exist

---

## Testing Tips

When testing the generated test:

1. **Test in Planning Mode First**
   - Go through entire test flow
   - Check all questions appear correctly
   - Verify data saves to database
   - Check validation logic works

2. **Check Dashboard Integration**
   - Test appears in planning section
   - Participant count increments
   - TestDetail page shows correct info
   - Results display properly

3. **Test Screen Recording**
   - Try with and without consent
   - Verify recording uploads
   - Check recording URL in database

4. **Test Data Collection**
   - Complete test multiple times
   - Verify all metrics save correctly
   - Check survey responses
   - Validate validation data

5. **Test Status Changes**
   - Change to "in progress"
   - Verify planning data hidden
   - Complete test and mark complete
   - Check final decisions saved

---

## Success Criteria

A successful test creation means:

✓ All files generated correctly
✓ No compilation errors
✓ Test runs locally (npm run dev)
✓ Components render properly
✓ Data saves to Supabase
✓ Validation logic works
✓ Dashboard integration complete
✓ Deployed successfully to Vercel
✓ Designer can complete test end-to-end
✓ Results display on dashboard

---

## End of Template

This completes the CREATE_NEW_TEST.md template. When a designer requests to create a new test, follow this template systematically, collecting all required information before generating code.

Remember: The goal is to make test creation feel like a conversation, not a form to fill out. Be friendly, offer examples, and validate understanding at each phase.