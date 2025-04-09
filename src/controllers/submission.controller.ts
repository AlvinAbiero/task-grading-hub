import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import Task from "../models/Task";
import Submission from "../models/Submission";
import { AppError } from "../middlewares/error";

export const submitTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("PDF file is required", 400);
    }

    const { taskId } = req.params;
    const studentId = req.user!.id;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      // Remove uploaded file if task doesn't exisy
      fs.unlinkSync(req.file.path);
      throw new AppError("Task not found", 404);
    }

    // Check if deadline has passed
    if (task.deadline < new Date()) {
      // Remove uploaded file if task doesn't exisy
      fs.unlinkSync(req.file.path);
      throw new AppError("Task submission deadline has passed", 404);
    }

    // Check if student has already submitted this task
    const existingSubmission = await Submission.findOne({
      task: taskId,
      student: studentId,
    });

    if (existingSubmission) {
      // Remove uploaded file if task doesn't exisy
      fs.unlinkSync(req.file.path);
      throw new AppError("you have already submitted this task", 404);
    }

    // create new submission
    const submission = new Submission({
      task: taskId,
      student: studentId,
      filePath: req.file.path,
      submittedAt: new Date(),
    });

    await submission.save();

    res.status(201).json({
      message: "Task submitted successfully",
      submission: {
        id: submission._id,
        taskId: submission.task,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    // If file exists bust there was an error in submission, clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const getSubmissionsByTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;

    // check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Get submissions for the task
    const submissions = await Submission.find({ task: taskId })
      .populate("student", "name email")
      .select("-filePath")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.params.studentId || req.user!.id;

    //    If requesting other students's submissions, check if user is admin
    if (studentId !== req.user!.id && req.user!.role !== "admin") {
      throw new AppError(
        "Access forbidden: You can only access your own submissins",
        403
      );
    }

    // get submissions for the student
    const submissions = await Submission.find({ student: studentId })
      .populate("task", "title deadline")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate("task", "title description deadline")
      .populate("student", "name email");

    if (!submission) {
      throw new AppError("Submission not found", 404);
    }

    // check if user is authorized to view this submission
    if (
      req.user!.role !== "admin" &&
      submission.student._id.toString() !== req.user!.id
    ) {
      throw new AppError(
        "Access forbidden: You can only access your own submissions",
        403
      );
    }

    res.status(200).json({ submission });
  } catch (error) {
    next(error);
  }
};

export const downloadSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { submissionId } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new AppError("Submission not found", 404);
    }

    // Check if user is authorized to download this submission
    if (
      req.user!.role !== "admin" &&
      submission.student.toString() !== req.user!.id
    ) {
      throw new AppError(
        "Access forbidden: You can only download your own submissions",
        403
      );
    }

    //  Check if file exists
    if (!fs.existsSync(submission.filePath)) {
      throw new AppError("Submission file not found", 404);
    }

    const filename = path.basename(submission.filePath);
    res.download(submission.filePath, filename);
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new AppError("Submission not found", 404);
    }

    submission.grade = grade;
    submission.feedback = feedback || null;
    submission.gradedAt = new Date();

    await submission.save();

    res.status(200).json({
      message: "Submission graded successfully",
      submission: {
        id: submission._id,
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
