import { Router, type Request, type Response, type NextFunction, type RequestHandler } from "express";
import {
    getPayments,
    getPaymentById,
    getPaymentSummary,
    createPaymentWithReceipt,
    createPaymentSimple,
    verifyPayment,
    deletePayment,
} from "../controllers/paymentController";
import {
    uploadSingle,
    uploadReceiptFile,
    uploadAttachmentFile,
    uploadReceiptOrAttachment,
    handleMulterError,
} from "../middleware/upload";

const router: Router = Router();

// Payment routes
router.get("/", getPayments); // Get all payments (Admin view)
router.get("/summary", getPaymentSummary); // Get payment statistics
router.get("/:id", getPaymentById); // Get payment by ID
// Accept JSON or multipart/form-data with optional 'attachment' or 'receipt'
const createPaymentHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    // Normalize file presence from either single or fields upload
    const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;
    let incomingFile: Express.Multer.File | undefined = req.file;
    if (!incomingFile && files) {
        incomingFile = files.attachment?.[0] || files.receipt?.[0];
        if (incomingFile) {
            // set req.file so downstream controller can use it transparently
            (req as any).file = incomingFile;
        }
    }

    if (incomingFile) {
        return (createPaymentWithReceipt as any)(req, res, next);
    }
    return (createPaymentSimple as any)(req, res, next);
};

// Use a middleware that accepts either field name for robustness
router.post("/", uploadReceiptOrAttachment, handleMulterError, createPaymentHandler);
router.post("/create-with-receipt", uploadReceiptFile, handleMulterError, createPaymentWithReceipt); // Create payment with optional receipt
router.delete("/:id", deletePayment); // Delete payment
// Verification routes (Admin only)
router.patch("/:id/verify", verifyPayment); // Verify payment (Admin)

export default router;
