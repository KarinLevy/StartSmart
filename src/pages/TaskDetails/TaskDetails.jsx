import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import './TaskDetails.css';

// Placeholder/dummy task — replaced by real data once the backend is connected.
const dummyTask = {
  title: 'Refine Product Architecture',
  description:
    'Finalize the technical documentation for the SmartScale module before the stakeholder sync. Review notes and prepare a summary.',
  scheduled: 'Mon, Oct 23 · 09:00',
  estimated: '45 min',
  status: 'In Progress',
  priority: true,
  tags: [
    { name: 'Work', color: '#6b38d4' },
    { name: 'Urgent', color: '#ba1a1a' },
  ],
};

const TaskDetails = () => {
  const [editing, setEditing] = useState(false);

  return (
    <PageShell
      narrow
      title="Task Details"
      subtitle="Review everything about this task before you start."
      actions={
        <>
          <button className="btn btn-secondary" onClick={() => setEditing((v) => !v)}>
            <span className="material-symbols-outlined">edit</span>
            {editing ? 'Done editing' : 'Edit'}
          </button>
          <button className="btn btn-danger">
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
        </>
      }
    >
      <div className="surface-card td-card">
        <div className="td-top">
          <div className="td-status-row">
            <span className="chip chip-progress">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>autorenew</span>
              {dummyTask.status}
            </span>
            {dummyTask.priority && (
              <span className="chip chip-priority">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>flag</span>
                High priority
              </span>
            )}
          </div>

          {editing ? (
            <input className="td-title-input" defaultValue={dummyTask.title} />
          ) : (
            <h3 className="td-title">{dummyTask.title}</h3>
          )}
        </div>

        <div className="td-field">
          <span className="td-field-label">Description</span>
          {editing ? (
            <textarea className="td-textarea" defaultValue={dummyTask.description} rows="4" />
          ) : (
            <p className="td-field-value">{dummyTask.description}</p>
          )}
        </div>

        <div className="td-meta-grid">
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon">calendar_month</span>
            <div>
              <span className="td-meta-label">Scheduled</span>
              <span className="td-meta-value">{dummyTask.scheduled}</span>
            </div>
          </div>
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon">hourglass_top</span>
            <div>
              <span className="td-meta-label">Estimated time</span>
              <span className="td-meta-value">{dummyTask.estimated}</span>
            </div>
          </div>
        </div>

        <div className="td-field">
          <span className="td-field-label">Tags</span>
          <div className="td-tags">
            {dummyTask.tags.map((tag) => (
              <span
                key={tag.name}
                className="td-tag"
                style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="td-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to dashboard
          </Link>
          <Link to="/focus-mode" className="btn btn-primary">
            <span className="material-symbols-outlined">play_arrow</span>
            Start task
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default TaskDetails;
