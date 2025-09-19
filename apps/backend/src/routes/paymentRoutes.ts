import { Router } from "express";
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
    handleMulterError,
} from "../middleware/upload";

const router: Router = Router();

// Payment routes
router.get("/", getPayments); // Get all payments (Admin view)
router.get("/summary", getPaymentSummary); // Get payment statistics
router.get("/:id", getPaymentById); // Get payment by ID
// Accept JSON or multipart/form-data with optional 'attachment'
router.post(
    "/",
    uploadAttachmentFile,
    handleMulterError,
    (req, res, next) => {
        // If a file is attached, use the receipt-aware controller
        if (req.file) {
            return (createPaymentWithReceipt as any)(req, res, next);
        }
        // Otherwise, fall back to simple JSON controller
        return (createPaymentSimple as any)(req, res, next);
    }
);
router.post("/create-with-receipt", uploadReceiptFile, handleMulterError, createPaymentWithReceipt); // Create payment with optional receipt
router.delete("/:id", deletePayment); // Delete payment
// Verification routes (Admin only)
router.patch("/:id/verify", verifyPayment); // Verify payment (Admin)

export default router;
