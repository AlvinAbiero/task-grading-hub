import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  task: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  filePath: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: Date;
  gradedAt: Date | null;
}

const submissionSchema = new Schema<ISubmission>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>("Submission", submissionSchema);
