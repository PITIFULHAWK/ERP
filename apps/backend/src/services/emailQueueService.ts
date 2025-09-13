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

    // Payment submitted email
    async queuePaymentSubmittedEmail(
        userEmail: string,
        userName: string,
        paymentId: string,
        amount: number,
        currency: string,
        type: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `payment_submitted_${paymentId}_${Date.now()}`,
            to: userEmail,
            subject: "Payment Submitted Successfully",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">Payment Submitted Successfully</h2>
                    <p>Dear ${userName},</p>
                    <p>We have received your payment submission. Your payment is now pending verification by our admin team.</p>
                    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Payment ID:</strong> ${paymentId}<br>
                        <strong>Amount:</strong> ${currency} ${amount}<br>
                        <strong>Type:</strong> ${type}<br>
                        <strong>Status:</strong> Pending Verification<br>
                        <strong>Submitted On:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <p><strong>What's Next?</strong></p>
                    <ul>
                        <li>Upload your payment receipt/proof of payment</li>
                        <li>Our admin team will review and verify your payment</li>
                        <li>You'll receive a confirmation email once verified</li>
                    </ul>
                    <p><strong>Important:</strong> Please ensure you upload a clear and valid payment receipt to expedite the verification process.</p>
                    <p>You can track your payment status in your dashboard.</p>
                    <p>Thank you!</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: "normal",
            metadata: {
                type: "payment_submitted",
                paymentId,
                amount,
                currency,
                paymentType: type,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    // Receipt uploaded email
    async queueReceiptUploadedEmail(
        userEmail: string,
        userName: string,
        paymentId: string,
        receiptId: string
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `receipt_uploaded_${receiptId}_${Date.now()}`,
            to: userEmail,
            subject: "Payment Receipt Uploaded Successfully",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Receipt Uploaded Successfully</h2>
                    <p>Dear ${userName},</p>
                    <p>Your payment receipt has been uploaded successfully and is now under review.</p>
                    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Payment ID:</strong> ${paymentId}<br>
                        <strong>Receipt ID:</strong> ${receiptId}<br>
                        <strong>Uploaded On:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <p>Our verification team will review your receipt and update the payment status accordingly. This usually takes 1-2 business days.</p>
                    <p>You'll receive another email notification once your payment has been verified.</p>
                    <p>Thank you for your patience!</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: "normal",
            metadata: {
                type: "receipt_uploaded",
                paymentId,
                receiptId,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    // Payment verified email
    async queuePaymentVerifiedEmail(
        userEmail: string,
        userName: string,
        paymentId: string,
        status: string,
        amount: number,
        currency: string,
        type: string,
        notes?: string
    ): Promise<void> {
        const isVerified = status === "VERIFIED";
        const emailJob: EmailJob = {
            id: `payment_${status.toLowerCase()}_${paymentId}_${Date.now()}`,
            to: userEmail,
            subject: isVerified
                ? "Payment Verified Successfully"
                : "Payment Verification Update",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${isVerified ? "#28a745" : "#dc3545"};">
                        Payment ${isVerified ? "Verified Successfully" : "Verification Update"}
                    </h2>
                    <p>Dear ${userName},</p>
                    <p>We have an important update regarding your payment verification.</p>
                    <div style="background-color: ${isVerified ? "#d4edda" : "#f8d7da"}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Payment ID:</strong> ${paymentId}<br>
                        <strong>Amount:</strong> ${currency} ${amount}<br>
                        <strong>Type:</strong> ${type}<br>
                        <strong>Status:</strong> ${status}<br>
                        <strong>Verified On:</strong> ${new Date().toLocaleDateString()}
                        ${notes ? `<br><strong>Admin Notes:</strong> ${notes}` : ""}
                    </div>
                    ${
                        isVerified
                            ? `<p>🎉 Great news! Your payment has been successfully verified and processed.</p>
                         <p><strong>What This Means:</strong></p>
                         <ul>
                             <li>Your payment is now confirmed in our system</li>
                             <li>Your ${type.toLowerCase()} enrollment is secured</li>
                             <li>You can proceed with the next steps of your enrollment</li>
                         </ul>
                         <p>Thank you for choosing us!</p>`
                            : `<p>Unfortunately, there was an issue with your payment verification. Please check the admin notes above for more details.</p>
                         <p><strong>Next Steps:</strong></p>
                         <ul>
                             <li>Review the admin feedback</li>
                             <li>Submit a new payment if required</li>
                             <li>Contact support if you need assistance</li>
                         </ul>`
                    }
                    <p>You can view the complete details in your dashboard.</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
            priority: isVerified ? "high" : "normal",
            metadata: {
                type: "payment_verification",
                paymentId,
                status,
                amount,
                currency,
                paymentType: type,
                userId: userEmail,
            },
        };

        await this.queueEmail(emailJob);
    }

    // Placement notification email
    async queuePlacementNotificationEmail(
        userEmail: string,
        userName: string,
        userCgpa: number | null,
        placement: any
    ): Promise<void> {
        const emailJob: EmailJob = {
            id: `placement_notification_${placement.id}_${Date.now()}`,
            to: userEmail,
            subject: `New Placement Opportunity: ${placement.title} at ${placement.companyName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">New Placement Opportunity</h2>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e40af; margin-top: 0;">${placement.title}</h3>
                        <p><strong>Company:</strong> ${placement.companyName}</p>
                        <p><strong>Position:</strong> ${placement.position}</p>
                        ${placement.packageOffered ? `<p><strong>Package:</strong> ${placement.packageOffered}</p>` : ""}
                        ${placement.location ? `<p><strong>Location:</strong> ${placement.location}</p>` : ""}
                        ${placement.applicationDeadline ? `<p><strong>Application Deadline:</strong> ${new Date(placement.applicationDeadline).toLocaleDateString()}</p>` : ""}
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <h4>Description:</h4>
                        <p style="line-height: 1.6;">${placement.description}</p>
                    </div>
                    
                    ${
                        placement.cgpaCriteria
                            ? `
                    <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <p style="margin: 0; color: #059669;">
                            <strong>Eligibility:</strong> Minimum CGPA requirement: ${placement.cgpaCriteria}
                            ${userCgpa ? ` (Your CGPA: ${userCgpa})` : ""}
                        </p>
                    </div>
                    `
                            : ""
                    }
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        <p>Dear ${userName},</p>
                        <p>This is an automated notification from the ERP Placement System.</p>
                        <p>For any queries, please contact the placement office.</p>
                    </div>
                </div>
            `,
            text: `
                New Placement Opportunity: ${placement.title}
                
                Dear ${userName},
                
                Company: ${placement.companyName}
                Position: ${placement.position}
                ${placement.packageOffered ? `Package: ${placement.packageOffered}\n` : ""}
                ${placement.location ? `Location: ${placement.location}\n` : ""}
                ${placement.applicationDeadline ? `Deadline: ${new Date(placement.applicationDeadline).toLocaleDateString()}\n` : ""}
                
                Description: ${placement.description}
                
                ${placement.cgpaCriteria ? `Minimum CGPA: ${placement.cgpaCriteria}${userCgpa ? ` (Your CGPA: ${userCgpa})` : ""}\n` : ""}
                
                This is an automated notification from the ERP Placement System.
                For any queries, please contact the placement office.
            `,
            priority: "normal" as const,
            metadata: {
                type: "placement_notification",
                placementId: placement.id,
                userId: userEmail,
                cgpaCriteria: placement.cgpaCriteria,
            },
        };

        await this.queueEmail(emailJob);
    }
}

export const emailQueueService = new EmailQueueService();
export default emailQueueService;
