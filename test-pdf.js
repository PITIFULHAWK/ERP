const PDFDocument = require('pdfkit');
const fs = require('fs');

// Test PDF generation
function generateTestPDF() {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
            Title: 'Payment Receipt',
            Author: 'ERP System',
            Subject: 'Test Payment Receipt',
            Creator: 'ERP System'
        }
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        
        doc.on('error', reject);
        
        // Header
        doc.fontSize(24)
           .fillColor('#1e40af')
           .text('PAYMENT RECEIPT', 50, 50, { align: 'center' });

        // University Name
        doc.fontSize(16)
           .fillColor('#374151')
           .text('SOA University', 50, 90, { align: 'center' });

        // Receipt Number
        doc.fontSize(12)
           .fillColor('#6b7280')
           .text('Receipt No: TEST-123-456', 50, 130);

        // Date
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 150);

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
           .text('Name: Demo Student', 50, 230)
           .text('Email: student@soa.ac.in', 50, 250);

        // Payment Details Section
        doc.fontSize(14)
           .fillColor('#1f2937')
           .text('PAYMENT DETAILS', 50, 290);

        // Payment details
        doc.fontSize(11)
           .fillColor('#374151')
           .text('Payment Type: COURSE', 50, 320)
           .fillColor('#1f2937')
           .text('COURSE', 200, 320);

        doc.fontSize(11)
           .fillColor('#374151')
           .text('Amount: INR 500,000', 50, 340)
           .fillColor('#1f2937')
           .text('INR 500,000', 200, 340);

        doc.fontSize(11)
           .fillColor('#374151')
           .text('Payment Method: MANUAL', 50, 360)
           .fillColor('#1f2937')
           .text('MANUAL', 200, 360);

        doc.fontSize(11)
           .fillColor('#374151')
           .text('Course: Computer Science Engineering', 50, 380)
           .fillColor('#1f2937')
           .text('Computer Science Engineering', 200, 380);

        // Status Badge
        doc.rect(450, 400, 100, 25)
           .fill('#10b981')
           .fillColor('#ffffff')
           .fontSize(12)
           .text('VERIFIED', 475, 410, { align: 'center' });

        // Footer
        doc.moveTo(50, 750)
           .lineTo(550, 750)
           .stroke('#e5e7eb');

        doc.fontSize(10)
           .fillColor('#6b7280')
           .text('This is a computer-generated receipt and does not require a signature.', 50, 760, { align: 'center' })
           .text('For any queries, please contact the university administration.', 50, 775, { align: 'center' });

        doc.end();
    });
}

// Test the PDF generation
generateTestPDF()
    .then(pdfBuffer => {
        console.log('✅ PDF generated successfully!');
        console.log(`📄 PDF size: ${pdfBuffer.length} bytes`);
        
        // Save to file for testing
        fs.writeFileSync('test-receipt.pdf', pdfBuffer);
        console.log('📁 PDF saved as test-receipt.pdf');
    })
    .catch(error => {
        console.error('❌ Error generating PDF:', error);
    });
