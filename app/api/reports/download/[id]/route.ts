import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const reportId = id;

    // Find the report in the database
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Parse the stored data
    const reportData = JSON.parse(report.data);
    
    // Generate file content based on the report type
    let fileContent: string;
    let contentType: string;
    let fileExtension: string;

    // Determine file format from file path
    const filePath = report.filePath || '';
    if (filePath.endsWith('.csv')) {
      fileContent = generateCSV(reportData);
      contentType = 'text/csv';
      fileExtension = 'csv';
    } else if (filePath.endsWith('.json')) {
      fileContent = JSON.stringify(reportData, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
    } else {
      // Default to CSV
      fileContent = generateCSV(reportData);
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    // Create filename
    const fileName = `${report.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    // Return file as download
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': Buffer.byteLength(fileContent).toString()
      }
    });

  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
}

function generateCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}