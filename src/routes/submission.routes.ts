import express from 'express'
import {submitTask, getStudentSubmissions, getSubmissionsByTask, getSubmissionById, downloadSubmission, gradeSubmission} from '../controllers/submission.controller'
import { taskIdValidator, submissionIdValidator, studentIdValidator, gradeValidator, validate } from '../utils/validators'
import { authenticate, isAdmin, isStudent,isResourceOwner } from '../middlewares/auth'
import { upload, handleUploadErrors } from '../middlewares/upload'

const router = express.Router()

/**
 * @swagger
 * /api/submissions/task/{taskId}:
 *   post:
 *     summary: Submit a task (student only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Task submitted successfully
 *       400:
 *         description: Validation error or deadline passed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 *       404:
 *         description: Task not found
 */
router.post('/task/:taskId', authenticate, isStudent, taskIdValidator,validate, upload.single('file'), handleUploadErrors, submitTask)

/**
 * @swagger
 * /api/submissions/task/{taskId}:
 *   get:
 *     summary: Get all submissions for a task (admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Task not found
 */
router.get('/task/:taskId', authenticate, isAdmin, taskIdValidator, validate, getSubmissionsByTask)

/**
 * @swagger
 * /api/submissions/student:
 *   get:
 *     summary: Get all submissions for the current student
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/student', authenticate, isStudent,  getStudentSubmissions);

/**
 * @swagger
 * /api/submissions/student/{studentId}:
 *   get:
 *     summary: Get all submissions for a specific student (admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/student/:studentId', authenticate, isAdmin, studentIdValidator, validate, getStudentSubmissions)

/**
 * @swagger
 * /api/submissions/{submissionId}:
 *   get:
 *     summary: Get a submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: Submission not found
 */
router.get('/:submissionId', authenticate, isResourceOwner, submissionIdValidator, validate, getSubmissionById)

/**
 * @swagger
 * /api/submissions/{submissionId}/download:
 *   get:
 *     summary: Download a submission file
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: Submission or file not found
 */
router.get('/:submissionId/download', authenticate, isResourceOwner, submissionIdValidator, validate, downloadSubmission);

/**
 * @swagger
 * /api/submissions/{submissionId}/grade:
 *   post:
 *     summary: Grade a submission (admin only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Submission not found
 */
router.post('/:submissionId/grade', authenticate, isAdmin, submissionIdValidator, gradeValidator, validate, gradeSubmission);

export default router;


