import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};


const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();


    doc.setFont(undefined, 'bold');
    doc.setFontSize(20);

    const pageWidth = doc.internal.pageSize.getWidth();
    const text = "Invoice";
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    const lineY = 20;

    // Left line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, lineY, textX - 5, lineY); // from 14 to just before the text

    // Invoice text centered
    doc.text(text, textX, lineY);

    // Right line
    doc.line(textX + textWidth + 5, lineY, pageWidth - 14, lineY); // from just after the text to right margin

    doc.setFont(undefined, 'normal'); // reset to normal after heading


    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Invoice:", 14, 30);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoice.invoiceNumber}`, 45, 30);

    doc.setFont(undefined, 'bold');
    doc.text("Date:", 14, 35);
    doc.setFont(undefined, 'normal');
    doc.text(`${formatDate(invoice.dateOfIssue)}`, 45, 35);

    doc.setFont(undefined, 'bold');
    doc.text("Due Date:", 14, 40);
    doc.setFont(undefined, 'normal');
    doc.text(`${formatDate(invoice.dueDate)}`, 45, 40);


    doc.setFont(undefined, 'bold');
    doc.text("Customer:", 14, 45);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoice.customerName}`, 45, 45);

    doc.setFont(undefined, 'bold');
    doc.text("Address:", 14, 50);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoice.billingAddress}`, 45, 50);


    const productRows = invoice.products.map(p => [
        p.productName,
        p.quantity,
        p.sellingPrice,
        p.quantity * p.sellingPrice,
    ]);

    autoTable(doc, {
        startY: 60,
        head: [["Product", "Qty", "Selling Price", "Total"]],
        body: productRows,
        headStyles: { fontStyle: 'bold' },
    });

    const y = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, 'bold');
    doc.text("Subtotal:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(`₹${invoice.subtotal}`, 40, y);

    doc.setFont(undefined, 'bold');
    doc.text("Discount:", 14, y + 5);
    doc.setFont(undefined, 'normal');
    doc.text(`₹${invoice.discount}`, 40, y + 5);

    doc.setFont(undefined, 'bold');
    doc.text("Tax:", 14, y + 10);
    doc.setFont(undefined, 'normal');
    doc.text(`₹${invoice.taxRate}`, 40, y + 10);

    doc.setFont(undefined, 'bold');
    doc.text("Shipping:", 14, y + 15);
    doc.setFont(undefined, 'normal');
    doc.text(`₹${invoice.shippingCost}`, 40, y + 15);

    doc.setFont(undefined, 'bold');
    doc.text("Total:", 14, y + 20);
    doc.setFont(undefined, 'normal');
    doc.text(`₹${invoice.totalAmount}`, 40, y + 20);

    doc.setFont(undefined, 'bold');
    doc.text("Status:", 14, y + 25);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoice.status}`, 40, y + 25);

    doc.setFont(undefined, 'bold');
    doc.text("Notes:", 14, y + 30);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoice.notes}`, 40, y + 30);


    return doc.output("arraybuffer");
};

export default generateInvoicePDF;
