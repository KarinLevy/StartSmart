import React from 'react';
import './TaskForm.css';

const TaskForm = () => {
  return (
    <div className="task-form-card">
      <form className="task-form">
        
        {/* Task Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-name">
            Task Name <span className="form-label-required">*</span>
          </label>
          <input 
            className="form-input" 
            id="task-name" 
            placeholder="e.g., Prepare Quarterly Presentation" 
            required 
            type="text" 
          />
        </div>

        {/* Task Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description (Optional)</label>
          <textarea 
            className="form-input form-textarea" 
            id="task-desc" 
            placeholder="Detail the task and any required tools..." 
            rows="4"
          ></textarea>
        </div>

        <div className="form-row">
          {/* Date & Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-datetime">Execution Date & Time</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-left">calendar_month</span>
              <input 
                className="form-input form-input-with-icon-left" 
                id="task-datetime" 
                type="datetime-local" 
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div className="form-group">
            <label className="form-label">Estimated Duration <span className="form-label-required">*</span></label>
            <div className="duration-inputs">
              <div className="duration-input-wrapper">
                <input 
                  className="form-input duration-input" 
                  min="0" 
                  placeholder="Hours" 
                  type="number" 
                />
                <span className="duration-unit">h</span>
              </div>
              <div className="duration-input-wrapper">
                <input 
                  className="form-input duration-input" 
                  max="59" 
                  min="0" 
                  placeholder="Min" 
                  type="number" 
                />
                <span className="duration-unit">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options / Category */}
        <div className="form-options">
          <button className="option-btn option-btn-primary" type="button">
            <span className="material-symbols-outlined option-icon">label</span>
            Add Tag
          </button>
          <button className="option-btn option-btn-secondary" type="button">
            <span className="material-symbols-outlined option-icon">flag</span>
            High Priority
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button className="action-btn-cancel" type="button">Cancel</button>
          <button className="action-btn-save" type="submit">Save Task</button>
        </div>

      </form>
    </div>
  );
};

export default TaskForm;
