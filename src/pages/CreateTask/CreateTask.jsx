import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import TaskForm from '../../components/TaskForm/TaskForm';
import MotivationalTip from '../../components/MotivationalTip/MotivationalTip';
import './CreateTask.css';
import Footer from '../../components/Footer/Footer';

const CreateTask = () => {
  return (
    <div className="create-task-layout">
      <Navbar />
      
      <main className="create-task-main">
        <section className="create-task-content">
          
          <div className="create-task-header">
            <h2 className="create-task-title">Create New Task</h2>
            <p className="create-task-subtitle">
              Let's plan your next success. Fill in the task details below.
            </p>
          </div>
          
          <TaskForm />
          
          <MotivationalTip />
          
        </section>
        
        {/* Footer Spacer */}
        <Footer />
      </main>
    </div>
  );
};

export default CreateTask;
