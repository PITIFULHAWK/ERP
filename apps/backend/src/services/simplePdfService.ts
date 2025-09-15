const PDFDocument = require('pdfkit');

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

export class SimplePDFService {
    async generateReceipt(data: PaymentReceiptData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
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
                
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                
                doc.on('error', reject);
                
                this.renderReceipt(doc, data);
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private renderReceipt(doc: any, data: PaymentReceiptData) {
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
        doc.text(`Date: ${new Date(data.verifiedAt).toLocaleDateString('en-IN')}`, 50, 150);

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

        // Payment details
        doc.fontSize(11)
           .fillColor('#374151')
           .text('Payment Type:', 50, 320)
           .fillColor('#1f2937')
           .text(data.paymentType, 200, 320);

        doc.fontSize(11)
           .fillColor('#374151')
           .text('Amount:', 50, 340)
           .fillColor('#1f2937')
           .text(`${data.currency} ${data.amount.toLocaleString('en-IN')}`, 200, 340);

        doc.fontSize(11)
           .fillColor('#374151')
           .text('Payment Method:', 50, 360)
           .fillColor('#1f2937')
           .text(data.paymentMethod, 200, 360);

        if (data.courseName) {
            doc.fontSize(11)
               .fillColor('#374151')
               .text('Course:', 50, 380)
               .fillColor('#1f2937')
               .text(data.courseName, 200, 380);
        }

        if (data.hostelName) {
            doc.fontSize(11)
               .fillColor('#374151')
               .text('Hostel:', 50, 400)
               .fillColor('#1f2937')
               .text(data.hostelName, 200, 400);
        }

        // Verification Section
        doc.fontSize(14)
           .fillColor('#1f2937')
           .text('VERIFICATION DETAILS', 50, 440);

        doc.fontSize(11)
           .fillColor('#374151')
           .text(`Verified By: ${data.verifiedBy}`, 50, 470)
           .text(`Verified On: ${new Date(data.verifiedAt).toLocaleString('en-IN')}`, 50, 490);

        if (data.verificationNotes) {
            doc.text(`Notes: ${data.verificationNotes}`, 50, 510);
        }

        // Status Badge
        const statusY = 550;
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
    }
}

export const simplePdfService = new SimplePDFService();
export default simplePdfService;
