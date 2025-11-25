# New Test Project Template

This document provides a template for adding new user test projects to the User Testing Hub.

## Required Information to Gather

When the user requests a new test, ask for these details if not provided:

### 1. Basic Project Information
- **Test ID** (lowercase, hyphenated, e.g., "highlights", "navigation-test")
- **Title** (display name, e.g., "Birth Record Highlights")
- **Description** (short summary for dashboard card)
- **Objective** (detailed goal for the overview section)
- **URL** (where the test is hosted)
- **Created Date** (e.g., "November 2025")

### 2. Test Tasks
- List of tasks users will complete (typically 3-5 tasks)
- Each task should have a clear description
- Example: "Task A: Manual highlight with attach/detach buttons"

### 3. Data Collection Details
- What questions will be asked in the survey?
- What data needs to be validated for "actual success"?
- Any custom metrics or fields needed?

## Files to Update

### 1. Dashboard.jsx (`src/pages/Dashboard.jsx`)
Add new test object to the `tests` array:

```javascript
{
  id: 'test-id',
  title: 'Test Title',
  description: 'Brief description',
  status: 'planning', // Always start in planning
  created: 'Month Year',
  participants: 0,
  url: 'https://test-url.com',
}
```

### 2. TestDetail.jsx (`src/pages/TestDetail.jsx`)
Add new test entry to `testData` object:

```javascript
'test-id': {
  title: 'Test Title',
  description: 'Brief description',
  objective: 'Detailed objective',
  tasks: [
    'Task 1 description',
    'Task 2 description',
    'Task 3 description',
  ],
  created: 'Month Year',
  status: 'planning',
  participants: 0,
  url: 'https://test-url.com/',
}
```

## Database Considerations

### Required Tables Structure
The test will work with existing Supabase tables:

1. **test_sessions**
   - `id`, `test_id`, `created_at`, `completed_at`
   - `project_status` (planning/in progress/complete)

2. **task_completions**
   - `id`, `session_id`, `task_id`, `time_spent_seconds`
   - `difficulty_rating`, `self_reported_success`, `actual_success`

3. **survey_responses**
   - `id`, `session_id`, `preferred_method`, `preference_reason`
   - Customize fields as needed for the specific test

4. **task_validation_data**
   - `id`, `session_id`, `task_id`
   - Add custom validation fields as needed

### Custom Survey Questions
If the test needs different survey questions than the default:
- Update `fetchTestResults()` in `supabase.js` to handle custom fields
- Update `calculateStatistics()` to process new data types
- Modify the Results display in TestDetail.jsx as needed

## Built-in Features

Every test project automatically includes:

### Status Management
- **Planning**: For prototype testing
- **In Progress**: For live user testing
- **Complete**: With final decisions recording

### Manual Observations
- Add observations from interviews/recordings
- Tally system for tracking frequency
- Edit and delete capabilities
- Auto-sorted by mention count

### Results Filtering
- Results automatically filter by project status
- Planning phase data separate from in-progress data
- Complete status shows in-progress results

### Quick Actions
- Launch Test button (disabled when complete)
- Change Status (context-aware)
- Export Results to CSV

### Data Persistence
- All stored in localStorage per project
- Final decisions saved
- Manual observations saved
- Status changes saved

## Customization Points

### If the test has unique requirements:

1. **Different Task Structure**
   - Update task display in TestDetail.jsx
   - Modify task validation logic as needed

2. **Custom Metrics**
   - Add new fields to survey_responses table
   - Update calculateStatistics() function
   - Add custom visualizations in Results section

3. **Special Validations**
   - Add custom validation logic in task_validation_data
   - Update actual_success calculation

## Checklist for Adding New Test

- [ ] Gather all required information from user
- [ ] Add test entry to Dashboard.jsx `tests` array
- [ ] Add test entry to TestDetail.jsx `testData` object
- [ ] If custom survey questions: Update Supabase schema
- [ ] If custom metrics: Update `calculateStatistics()`
- [ ] If custom results display: Update Results section in TestDetail.jsx
- [ ] Test the complete workflow: Planning → In Progress → Complete
- [ ] Verify all features work: observations, status changes, results filtering

## Example Interaction

When user says: "I want to add a new test for navigation patterns"

Ask:
1. "What should the test ID be? (e.g., 'navigation-patterns')"
2. "What's the full title for this test?"
3. "Can you provide a brief description for the dashboard?"
4. "What's the main objective of this test?"
5. "What URL is the test hosted at?"
6. "What tasks will users complete? Please list them."
7. "What survey questions will you ask? Are they similar to the highlights test or different?"
8. "How will you measure 'actual success' for each task?"

Then implement based on the template above.
