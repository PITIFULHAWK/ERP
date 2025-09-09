import { Router } from "express";
import { getPayments, getSummary, submitPayment, uploadReceipt, setPaymentVerification } from "../controllers/paymentController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";

const router : Router = Router();
router.post("/", requireAuth, submitPayment);
router.get("/summary/:userId", requireAuth, getSummary);
router.get("/", requireAuth, getPayments);
router.post("/:paymentId/receipts", requireAuth, uploadReceipt); // expects body: { uploadedById, mediaUrl, mediaType, notes }
router.post("/:paymentId/verify", requireAuth, requireAdmin, setPaymentVerification); // body: { verified: boolean, adminId }

export default router;


