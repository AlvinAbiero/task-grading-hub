import { Request, Response, NextFunction } from "express";
import Task from "../models/Task";
import Submission from "../models/Submission";
import { AppError } from "../middlewares/error";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, deadline } = req.body;

    const task = new Task({
      title,
      description,
      deadline: new Date(deadline),
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if there are already submissions for this task
    const submissions = await Submission.countDocuments({ task: id });
    if (submissions > 0) {
      throw new AppError("Cannot update task that alredy has submissions", 400);
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline ? new Date(deadline) : task.deadline;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if there are already submissions for this task
    const submissions = await Submission.countDocuments({ task: id });
    if (submissions > 0) {
      throw new AppError(
        "Cannot delete task that already has submissions",
        400
      );
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
