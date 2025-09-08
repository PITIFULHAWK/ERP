import { createClient } from "redis";

// Email job interface (should match the worker interface)
export interface EmailJob {
    id: string;
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
    priority?: "low" | "normal" | "high";
    scheduledAt?: string; // ISO date string
    metadata?: Record<string, any>;
}

export class EmailQueueService {
    private redisClient: any;
    private queueName: string = "email_queue";
    private highPriorityQueueName: string = "email_queue_high";

    constructor(redisUrl?: string) {
        this.initializeRedis(redisUrl);
    }

    private async initializeRedis(redisUrl?: string) {
        try {
            this.redisClient = createClient({
                url:
                    redisUrl ||
                    process.env.REDIS_URL ||
                    "redis://localhost:6379",
            });

            this.redisClient.on("error", (err: Error) => {
                console.error("Redis Client Error (Email Queue):", err);
            });

            await this.redisClient.connect();
        } catch (error) {
            console.error("Failed to connect to Redis (Email Queue):", error);
            throw error;
        }
    }

    async addEmailJob(emailJob: EmailJob): Promise<void> {
        try {
            // Generate ID if not provided
            if (!emailJob.id) {
                emailJob.id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            // Add timestamp
            emailJob.metadata = {
                ...emailJob.metadata,
                createdAt: new Date().toISOString(),
            };

            const queueName =
                emailJob.priority === "high"
                    ? this.highPriorityQueueName
                    : this.queueName;

            await this.redisClient.lPush(queueName, JSON.stringify(emailJob));

            console.log(`✅ Email job added to queue: ${emailJob.id}`);
        } catch (error) {
            console.error("Failed to add email job to queue:", error);
            throw error;
        }
    }

    async getQueueLength(): Promise<number> {
        try {
            const normalQueue = await this.redisClient.lLen(this.queueName);
            const highPriorityQueue = await this.redisClient.lLen(
                this.highPriorityQueueName
            );
            return normalQueue + highPriorityQueue;
        } catch (error) {
            console.error("Failed to get queue length:", error);
            return 0;
        }
    }

    async disconnect(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
    }

    // Helper methods for common email types
    async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
        const emailJob: EmailJob = {
            id: `welcome_${Date.now()}`,
            to: userEmail,
            subject: "Welcome to ERP System",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to ERP System!</h1>
          <p>Dear ${userName},</p>
          <p>Welcome to our ERP system. Your account has been successfully created.</p>
          <p>You can now log in and start using the system.</p>
          <p>Best regards,<br>ERP System Team</p>
        </div>
      `,
            text: `Welcome to ERP System! Dear ${userName}, your account has been successfully created.`,
            priority: "normal",
            metadata: {
                type: "welcome",
                userName,
            },
        };

        await this.addEmailJob(emailJob);
    }

    async sendApplicationStatusEmail(
        userEmail: string,
        userName: string,
        status: string,
        applicationId: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `application_status_${applicationId}`,
            to: userEmail,
            subject: `Application Status Update - ${status}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Application Status Update</h1>
          <p>Dear ${userName},</p>
          <p>Your application (ID: ${applicationId}) status has been updated to: <strong>${status}</strong></p>
          <p>Please log in to your account for more details.</p>
          <p>Best regards,<br>ERP System Team</p>
        </div>
      `,
            text: `Application Status Update: Your application ${applicationId} status is now ${status}`,
            priority: "normal",
            metadata: {
                type: "application_status",
                applicationId,
                status,
            },
        };

        await this.addEmailJob(emailJob);
    }

    async sendExamNotificationEmail(
        userEmail: string,
        userName: string,
        examName: string,
        examDate: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `exam_notification_${Date.now()}`,
            to: userEmail,
            subject: `Exam Notification - ${examName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Exam Notification</h1>
          <p>Dear ${userName},</p>
          <p>This is a reminder that you have an upcoming exam:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin: 0; color: #333;">${examName}</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(examDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(examDate).toLocaleTimeString()}</p>
          </div>
          <p>Please be prepared and arrive on time.</p>
          <p>Best regards,<br>ERP System Team</p>
        </div>
      `,
            text: `Exam Notification: ${examName} on ${new Date(examDate).toLocaleDateString()}`,
            priority: "high",
            metadata: {
                type: "exam_notification",
                examName,
                examDate,
            },
        };

        await this.addEmailJob(emailJob);
    }

    async sendPasswordResetEmail(
        userEmail: string,
        resetToken: string
    ): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const emailJob: EmailJob = {
            id: `password_reset_${Date.now()}`,
            to: userEmail,
            subject: "Password Reset Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p>You have requested to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>ERP System Team</p>
        </div>
      `,
            text: `Password reset requested. Click this link to reset: ${resetUrl}`,
            priority: "high",
            metadata: {
                type: "password_reset",
                resetToken,
            },
        };

        await this.addEmailJob(emailJob);
    }
}

// Singleton instance for use across the application
export const emailQueue = new EmailQueueService();
