import json
import os
from datetime import datetime

# Class to represent a single task
class Task:
    """Represents a single task with title, description, and status."""
    def __init__(self, title, description="", status="Pending"):
        self.title = title
        self.description = description
        self.status = status
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Convert task to dictionary for JSON serialization
    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at

        }

# Class to manage all tasks
class TaskManager:
    """Manages a collection of tasks with file persistence."""
    def __init__(self, filename="tasks.json"):
        self.filename = filename
        self.tasks = []
        self.load_tasks()

    # Load tasks from file
    def load_tasks(self):
        """Load tasks from JSON file. Creates file if it doesn't exist."""
        try:
            if os.path.exists(self.filename):
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    for task_data in data:
                        task = Task(
                            task_data["title"],
                            task_data.get("description", ""),
                            task_data.get("status", "Pending")
                        )
                        self.tasks.append(task)
            print(f"✓ Loaded {len(self.tasks)} tasks")
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"⚠ Starting with empty task list")
            self.tasks = []

    # Save tasks to file
    def save_tasks(self):
        """Save all tasks to JSON file."""
        try:
            with open(self.filename, 'w') as f:
                task_list = [task.to_dict() for task in self.tasks]
                json.dump(task_list, f, indent=2)
            print("✓ Tasks saved!")
        except IOError as e:
            print(f"✗ Error saving tasks: {e}")

    # Add a new task
    def add_task(self, title, description=""):
        """Add a new task to the manager."""
        if title.strip():
            self.tasks.append(Task(title, description))
            print(f"✓ Task '{title}' added!")
            self.save_tasks()
        else:
            print("✗ Task title cannot be empty!")

    # Mark task as complete
    def complete_task(self, index):
        """Mark a task as complete by index."""
        try:
            if 0 <= index < len(self.tasks):
                self.tasks[index].status = "Completed"
                print(f"✓ Task marked as completed!")
                self.save_tasks()
            else:
                print("✗ Invalid task index!")
        except IndexError:
            print("✗ Task not found!")

    # Remove a task
    def remove_task(self, index):
        """Remove a task by index."""
        try:
            if 0 <= index < len(self.tasks):
                removed = self.tasks.pop(index)
                print(f"✓ Task '{removed.title}' removed!")
                self.save_tasks()
            else:
                print("✗ Invalid task index!")
        except IndexError:
            print("✗ Task not found!")

    # Display all tasks
    def view_tasks(self):
        """Display all tasks with their status."""
        if not self.tasks:
            print("\n📋 No tasks yet! Add one to get started.\n")
            return
        
        print("\n" + "="*70)
        print(f"{'#':<3} {'Task':<20} {'Status':<12} {'Created':<20}")
        print("="*70)
        for i, task in enumerate(self.tasks):
            status_symbol = "✓" if task.status == "Completed" else "○"
            print(f"{i:<3} {task.title:<20} {status_symbol} {task.status:<10} {task.created_at}")
        print("="*70 + "\n")

# Main menu function
def main():
    """Main program loop with user menu."""
    manager = TaskManager()
    
    while True:
        print("\n📌 TASK MANAGER")
        print("1. View all tasks")
        print("2. Add new task")
        print("3. Complete task")
        print("4. Remove task")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            manager.view_tasks()
        elif choice == "2":
            title = input("Enter task title: ").strip()
            description = input("Enter task description (optional): ").strip()
            manager.add_task(title, description)
        elif choice == "3":
            manager.view_tasks()
            try:
                index = int(input("Enter task number to complete: "))
                manager.complete_task(index)
            except ValueError:
                print("✗ Please enter a valid number!")
        elif choice == "4":
            manager.view_tasks()
            try:
                index = int(input("Enter task number to remove: "))
                manager.remove_task(index)
            except ValueError:
                print("✗ Please enter a valid number!")
        elif choice == "5":
            print("\n✓ Goodbye! Your tasks are saved. 👋\n")
            break
        else:
            print("✗ Invalid choice! Please try again.")

if __name__ == "__main__":
    main()
