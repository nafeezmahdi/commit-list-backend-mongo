require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Required to connect React to Node
const connectDB = require("./dbconfig");

const app = express();

// --- MIDDLEWARE ---
// This allows your React app (usually port 5173) to send requests here
app.use(cors());
// This allows Express to read JSON data sent from the frontend
app.use(express.json());

// --- DATABASE CONNECTION ---
connectDB();

// --- DATABASE SCHEMA & MODEL ---
// This now matches all the fields in your "Create New Todo" modal
const TodoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignee: { type: String, default: "Unassigned" },
    dueDate: { type: String, default: "" }, // Can be String or Date depending on your frontend
    category: { type: String, default: "None" },
    status: { type: String, default: "Pending" },
    priority: { type: String, default: "Medium" },
  },
  { timestamps: true },
); // Automatically adds 'createdAt' and 'updatedAt'

const Todo = mongoose.model("Todo", TodoSchema);

// --- API ROUTES ---

// READ: Get all tasks (Useful for displaying them on your UI later)
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    // const todos = await Todo.find().populate("subtasks").populate("comments");

    res.status(200).json({
      message: "Tasks retrieved successfully",
      success: true,
      data: todos,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      message: "Failed to retrieve tasks",
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    // If you have sub-documents stored as references, you MUST populate them
    // const todo = await Todo.findById(req.params.id)
    //   .populate("subtasks")
    //   .populate("comments");

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
        success: false,
      });
    } else {
      res.status(200).json({
        message: "Task retrieved successfully",
        success: true,
        data: todo,
      });
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      message: "Failed to retrieve task",
      success: false,
      error: error.message,
    });
  }
});

// CREATE: Save a new task to the database
app.post("/api/add-todo", async (req, res) => {
  try {
    const newTodo = await Todo.create(req.body);
    res.status(201).json({
      message: "Task created successfully",
      success: true,
      data: newTodo,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({
      message: "Failed to create task",
      success: false,
      error: error.message,
    });
  }
});

//
app.delete("/api/delete-all-todos", async (req, res) => {
  try {
    await Todo.deleteMany({});
    res.status(200).json({
      message: "All tasks deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting all tasks:", error);
    res.status(500).json({
      message: "Failed to delete all tasks",
      success: false,
      error: error.message,
    });
  }
});

//
app.delete("/api/delete-todo/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Task deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting task");
    res.status(500).json({
      message: "Failed to delete task",
      success: false,
      error: error.message,
    });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
