import { createClient } from "redis";

interface EmailJob {
    id: string;
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    priority?: "low" | "normal" | "high";
    metadata?: Record<string, any>;
}

class EmailQueueService {
    private redisClient: any;
    private queueName: string = "email_queue";

    constructor() {
        this.initializeRedis();
    }

    private async initializeRedis() {
        try {
            this.redisClient = createClient({
                url: process.env.REDIS_URL || "redis://localhost:6379",
            });

            this.redisClient.on("error", (err: Error) => {
                console.error("Redis Client Error:", err);
            });

            await this.redisClient.connect();
            console.log("✅ Email Queue Service connected to Redis");
        } catch (error) {
            console.error("❌ Failed to connect to Redis:", error);
        }
    }

    private async queueEmail(emailJob: EmailJob): Promise<void> {
        try {
            await this.redisClient.lPush(
                this.queueName,
                JSON.stringify(emailJob)
            );
            console.log(
                `📧 Email queued: ${emailJob.id} - ${emailJob.subject}`
            );
        } catch (error) {
            console.error("❌ Failed to queue email:", error);
        }
    }

    // Application submitted email
    async queueApplicationSubmittedEmail(
        userEmail: string,
        userName: string,
        applicationId: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `app_submitted_${applicationId}_${Date.now()}`,
            to: userEmail,
            subject: "Application Submitted Successfully",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c5aa0;">Application Submitted Successfully</h2>
                    <p>Dear ${userName},</p>
                    <p>Your application has been submitted successfully.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Application ID:</strong> ${applicationId}<br>
                        <strong>Status:</strong> Under Review<br>
                        <strong>Submitted On:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <p>You will receive further updates via email as your application progresses through the verification process.</p>
                    <p>Next Steps:</p>
                    <ul>
                        <li>Upload all required documents if not already done</li>
                        <li>Wait for document verification</li>
                        <li>Application review by our team</li>
                    </ul>
                    <p>Thank you for choosing our institution!</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: "normal",
            metadata: {
                type: "application_submitted",
                applicationId,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    // Document verified email
    async queueDocumentVerifiedEmail(
        userEmail: string,
        userName: string,
        documentType: string,
        applicationId: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `doc_verified_${applicationId}_${Date.now()}`,
            to: userEmail,
            subject: "Document Verified Successfully",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Document Verified Successfully</h2>
                    <p>Dear ${userName},</p>
                    <p>Good news! Your document has been verified successfully.</p>
                    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Document Type:</strong> ${documentType}<br>
                        <strong>Application ID:</strong> ${applicationId}<br>
                        <strong>Verified On:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <p>Your document has been reviewed and approved by our verification team. This brings you one step closer to the completion of your application process.</p>
                    <p>If you have more documents pending verification, please ensure they are uploaded and wait for further updates.</p>
                    <p>Thank you for your patience!</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: "normal",
            metadata: {
                type: "document_verified",
                applicationId,
                documentType,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    // Application verified/approved email
    async queueApplicationVerifiedEmail(
        userEmail: string,
        userName: string,
        applicationId: string,
        status: string,
        notes?: string
    ): Promise<void> {
        const isApproved = status === "VERIFIED";
        const emailJob: EmailJob = {
            id: `app_${status.toLowerCase()}_${applicationId}_${Date.now()}`,
            to: userEmail,
            subject: isApproved
                ? "Application Approved!"
                : "Application Status Update",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${isApproved ? "#28a745" : "#dc3545"};">
                        Application ${isApproved ? "Approved" : "Status Update"}
                    </h2>
                    <p>Dear ${userName},</p>
                    <p>We have an important update regarding your application.</p>
                    <div style="background-color: ${isApproved ? "#d4edda" : "#f8d7da"}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Application ID:</strong> ${applicationId}<br>
                        <strong>New Status:</strong> ${status}<br>
                        <strong>Updated On:</strong> ${new Date().toLocaleDateString()}
                        ${notes ? `<br><strong>Notes:</strong> ${notes}` : ""}
                    </div>
                    ${
                        isApproved
                            ? `<p>🎉 Congratulations! Your application has been approved. You can now proceed with the enrollment process.</p>
                         <p>Next Steps:</p>
                         <ul>
                             <li>Check your dashboard for enrollment instructions</li>
                             <li>Complete fee payment if required</li>
                             <li>Attend orientation sessions</li>
                         </ul>`
                            : `<p>Your application status has been updated. Please check your dashboard for more details and any required actions.</p>`
                    }
                    <p>If you have any questions, please contact our admissions office.</p>
                    <p>Thank you!</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: isApproved ? "high" : "normal",
            metadata: {
                type: "application_status_update",
                applicationId,
                status,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    async disconnect(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.disconnect();
        }
    }
}

export const emailQueueService = new EmailQueueService();
export default emailQueueService;
