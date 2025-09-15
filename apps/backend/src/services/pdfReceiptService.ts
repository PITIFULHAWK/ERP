const PDFDocument = require('pdfkit');
import fs from 'fs';
import path from 'path';

export interface PaymentReceiptData {
    paymentId: string;
    studentName: string;
    studentEmail: string;
    amount: number;
    currency: string;
    paymentType: string;
    courseName?: string;
    hostelName?: string;
    paymentMethod: string;
    reference: string;
    verifiedAt: string;
    verifiedBy: string;
    verificationNotes?: string;
    universityName: string;
}

export class PDFReceiptService {
    private generateReceiptPDF(data: PaymentReceiptData): Buffer {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Payment Receipt',
                Author: 'ERP System',
                Subject: `Payment Receipt - ${data.paymentId}`,
                Creator: 'ERP System'
            }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            
            doc.on('error', reject);
            
            this.renderReceipt(doc, data);
            doc.end();
        }) as any;
    }

    private renderReceipt(doc: PDFDocument, data: PaymentReceiptData) {
        // Header
        doc.fontSize(24)
           .fillColor('#1e40af')
           .text('PAYMENT RECEIPT', 50, 50, { align: 'center' });

        // University Name
        doc.fontSize(16)
           .fillColor('#374151')
           .text(data.universityName, 50, 90, { align: 'center' });

        // Receipt Number
        doc.fontSize(12)
           .fillColor('#6b7280')
           .text(`Receipt No: ${data.paymentId}`, 50, 130);

        // Date
        doc.text(`Date: ${new Date(data.verifiedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, 50, 150);

        // Line separator
        doc.moveTo(50, 180)
           .lineTo(550, 180)
           .stroke('#e5e7eb');

        // Student Information Section
        doc.fontSize(14)
           .fillColor('#1f2937')
           .text('STUDENT INFORMATION', 50, 200);

        doc.fontSize(11)
           .fillColor('#374151')
           .text(`Name: ${data.studentName}`, 50, 230)
           .text(`Email: ${data.studentEmail}`, 50, 250);

        // Payment Details Section
        doc.fontSize(14)
           .fillColor('#1f2937')
           .text('PAYMENT DETAILS', 50, 290);

        // Payment details table
        const paymentDetails = [
            ['Payment Type', data.paymentType],
            ['Amount', `${data.currency} ${data.amount.toLocaleString('en-IN')}`],
            ['Payment Method', data.paymentMethod],
            ['Reference', data.reference],
        ];

        if (data.courseName) {
            paymentDetails.push(['Course', data.courseName]);
        }
        if (data.hostelName) {
            paymentDetails.push(['Hostel', data.hostelName]);
        }

        let yPosition = 320;
        paymentDetails.forEach(([label, value]) => {
            doc.fontSize(11)
               .fillColor('#374151')
               .text(label + ':', 50, yPosition)
               .fillColor('#1f2937')
               .text(value, 200, yPosition);
            yPosition += 20;
        });

        // Verification Section
        doc.fontSize(14)
           .fillColor('#1f2937')
           .text('VERIFICATION DETAILS', 50, yPosition + 20);

        doc.fontSize(11)
           .fillColor('#374151')
           .text(`Verified By: ${data.verifiedBy}`, 50, yPosition + 50)
           .text(`Verified On: ${new Date(data.verifiedAt).toLocaleString('en-IN')}`, 50, yPosition + 70);

        if (data.verificationNotes) {
            doc.text(`Notes: ${data.verificationNotes}`, 50, yPosition + 90);
        }

        // Status Badge
        const statusY = yPosition + 120;
        doc.rect(450, statusY - 5, 100, 25)
           .fill('#10b981')
           .fillColor('#ffffff')
           .fontSize(12)
           .text('VERIFIED', 475, statusY, { align: 'center' });

        // Footer
        const footerY = 750;
        doc.moveTo(50, footerY)
           .lineTo(550, footerY)
           .stroke('#e5e7eb');

        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('This is a computer-generated receipt and does not require a signature.', 50, footerY + 10, { align: 'center' })
           .text('For any queries, please contact the university administration.', 50, footerY + 25, { align: 'center' });

        // QR Code placeholder (you can add actual QR code generation here)
        doc.rect(450, footerY + 10, 50, 50)
           .stroke('#d1d5db')
           .fontSize(8)
           .fillColor('#6b7280')
           .text('QR Code', 460, footerY + 30, { align: 'center' });
    }

    async generateReceipt(data: PaymentReceiptData): Promise<Buffer> {
        try {
            return await this.generateReceiptPDF(data);
        } catch (error) {
            console.error('Error generating PDF receipt:', error);
            throw new Error('Failed to generate PDF receipt');
        }
    }

    async generateReceiptFile(data: PaymentReceiptData, filename?: string): Promise<string> {
        try {
            const pdfBuffer = await this.generateReceipt(data);
            const fileName = filename || `receipt_${data.paymentId}_${Date.now()}.pdf`;
            const filePath = path.join(process.cwd(), 'temp', fileName);
            
            // Ensure temp directory exists
            const tempDir = path.dirname(filePath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, pdfBuffer);
            return filePath;
        } catch (error) {
            console.error('Error generating PDF file:', error);
            throw new Error('Failed to generate PDF file');
        }
    }
}

export const pdfReceiptService = new PDFReceiptService();
export default pdfReceiptService;
