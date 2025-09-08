import { createClient } from "redis";
import nodemailer from "nodemailer";

// Email job interface
interface EmailJob {
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

// Email configuration
interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

class EmailWorker {
    private redisClient: any;
    private transporter!: nodemailer.Transporter;
    private isRunning: boolean = false;
    private queueName: string = "email_queue";
    private processingQueueName: string = "email_processing";
    private retryQueueName: string = "email_retry";
    private maxRetries: number = 3;
    private retryDelay: number = 60000; // 1 minute

    constructor() {
        this.initializeRedis();
        this.initializeTransporter();
    }

    private async initializeRedis() {
        try {
            this.redisClient = createClient({
                url: process.env.REDIS_URL || "redis://localhost:6379",
            });

            this.redisClient.on("error", (err: Error) => {
                console.error("Redis Client Error:", err);
            });

            this.redisClient.on("connect", () => {
                console.log("✅ Connected to Redis");
            });

            await this.redisClient.connect();
        } catch (error) {
            console.error("❌ Failed to connect to Redis:", error);
            process.exit(1);
        }
    }

    private initializeTransporter() {
        const emailConfig: EmailConfig = {
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER || "",
                pass: process.env.SMTP_PASS || "",
            },
        };

        this.transporter = nodemailer.createTransport(emailConfig);

        // Verify connection configuration
        this.transporter.verify((error : any, success) => {
            if (error) {
                console.error("❌ SMTP configuration error:", error);
            } else {
                console.log("✅ SMTP server is ready to send emails");
            }
        });
    }

    async start() {
        console.log("🚀 Email Worker starting...");
        this.isRunning = true;

        // Start processing different queues
        this.processMainQueue();
        this.processRetryQueue();

        console.log("📧 Email Worker is running and listening for jobs...");
    }

    async stop() {
        console.log("🛑 Stopping Email Worker...");
        this.isRunning = false;
        await this.redisClient.disconnect();
        console.log("✅ Email Worker stopped");
    }

    private async processMainQueue() {
        while (this.isRunning) {
            try {
                // Use BRPOPLPUSH for atomic operation
                const result = await this.redisClient.brPopLPush(
                    this.queueName,
                    this.processingQueueName,
                    5 // 5 second timeout
                );

                if (result) {
                    const emailJob: EmailJob = JSON.parse(result);
                    await this.processEmailJob(emailJob);
                }
            } catch (error) {
                console.error("Error processing main queue:", error);
                await this.sleep(5000); // Wait 5 seconds before retrying
            }
        }
    }

    private async processRetryQueue() {
        while (this.isRunning) {
            try {
                // Check for retry jobs every 30 seconds
                await this.sleep(30000);

                const retryJobs = await this.redisClient.lRange(
                    this.retryQueueName,
                    0,
                    -1
                );

                for (const jobData of retryJobs) {
                    const retryJob = JSON.parse(jobData);
                    const scheduledTime = new Date(
                        retryJob.scheduledAt
                    ).getTime();
                    const currentTime = Date.now();

                    if (currentTime >= scheduledTime) {
                        // Remove from retry queue and process
                        await this.redisClient.lRem(
                            this.retryQueueName,
                            1,
                            jobData
                        );
                        await this.processEmailJob(retryJob.job);
                    }
                }
            } catch (error) {
                console.error("Error processing retry queue:", error);
            }
        }
    }

    private async processEmailJob(emailJob: EmailJob) {
        try {
            console.log(`📧 Processing email job: ${emailJob.id}`);
            console.log(
                `📧 To: ${Array.isArray(emailJob.to) ? emailJob.to.join(", ") : emailJob.to}`
            );
            console.log(`📧 Subject: ${emailJob.subject}`);

            // Prepare email options
            const mailOptions = {
                from:
                    emailJob.from ||
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,
                to: emailJob.to,
                subject: emailJob.subject,
                html: emailJob.html,
                text: emailJob.text,
                attachments: emailJob.attachments,
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);

            console.log(`✅ Email sent successfully: ${emailJob.id}`);
            console.log(`📧 Message ID: ${info.messageId}`);

            // Remove from processing queue
            await this.redisClient.lRem(
                this.processingQueueName,
                1,
                JSON.stringify(emailJob)
            );

            // Log success to Redis (optional)
            await this.logEmailResult(emailJob.id, "success", info);
        } catch (error) {
            console.error(`❌ Failed to send email: ${emailJob.id}`, error);
            await this.handleEmailFailure(emailJob, error as Error);
        }
    }

    private async handleEmailFailure(emailJob: EmailJob, error: Error) {
        try {
            const retryCount = (emailJob.metadata?.retryCount || 0) + 1;

            if (retryCount <= this.maxRetries) {
                console.log(
                    `🔄 Retrying email job: ${emailJob.id} (Attempt ${retryCount}/${this.maxRetries})`
                );

                // Update retry count
                emailJob.metadata = {
                    ...emailJob.metadata,
                    retryCount,
                    lastError: error.message,
                    lastAttempt: new Date().toISOString(),
                };

                // Schedule retry with exponential backoff
                const retryDelay =
                    this.retryDelay * Math.pow(2, retryCount - 1);
                const scheduledAt = new Date(
                    Date.now() + retryDelay
                ).toISOString();

                const retryJob = {
                    job: emailJob,
                    scheduledAt,
                };

                await this.redisClient.lPush(
                    this.retryQueueName,
                    JSON.stringify(retryJob)
                );
            } else {
                console.error(
                    `💀 Email job failed permanently: ${emailJob.id}`
                );
                await this.logEmailResult(emailJob.id, "failed", {
                    error: error.message,
                    retryCount,
                });
            }

            // Remove from processing queue
            await this.redisClient.lRem(
                this.processingQueueName,
                1,
                JSON.stringify(emailJob)
            );
        } catch (retryError) {
            console.error("Error handling email failure:", retryError);
        }
    }

    private async logEmailResult(
        jobId: string,
        status: "success" | "failed",
        details: any
    ) {
        try {
            const logEntry = {
                jobId,
                status,
                timestamp: new Date().toISOString(),
                details,
            };

            await this.redisClient.lPush(
                "email_logs",
                JSON.stringify(logEntry)
            );

            // Keep only last 1000 logs
            await this.redisClient.lTrim("email_logs", 0, 999);
        } catch (error) {
            console.error("Error logging email result:", error);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Utility method to get queue statistics
    async getQueueStats() {
        try {
            const mainQueueLength = await this.redisClient.lLen(this.queueName);
            const processingQueueLength = await this.redisClient.lLen(
                this.processingQueueName
            );
            const retryQueueLength = await this.redisClient.lLen(
                this.retryQueueName
            );

            return {
                mainQueue: mainQueueLength,
                processing: processingQueueLength,
                retry: retryQueueLength,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error getting queue stats:", error);
            return null;
        }
    }
}

// Start the email worker
async function main() {
    const emailWorker = new EmailWorker();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n📧 Received SIGINT, shutting down gracefully...");
        await emailWorker.stop();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n📧 Received SIGTERM, shutting down gracefully...");
        await emailWorker.stop();
        process.exit(0);
    });

    // Start the worker
    await emailWorker.start();

    // Log queue stats every 5 minutes
    setInterval(
        async () => {
            const stats = await emailWorker.getQueueStats();
            if (stats) {
                console.log("📊 Queue Stats:", stats);
            }
        },
        5 * 60 * 1000
    );
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

main().catch((error) => {
    console.error("❌ Failed to start email worker:", error);
    process.exit(1);
});
